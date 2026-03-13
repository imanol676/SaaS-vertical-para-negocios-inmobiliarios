import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BillingService } from "../servieces/billing.servieces";
import { ServiceError } from "../servieces/organization.serviece";
import { OrganizationService } from "../servieces/organization.serviece";
import { PlanId } from "../billing/plans";
import { createHmac } from "crypto";

export class BillingController {
  /**
   * POST /api/billing/subscribe
   * Crea una suscripción y devuelve la URL de checkout de MP
   */
  static async createSubscription(req: NextRequest) {
    try {
      const { userId, orgId } = await auth();

      if (!userId || !orgId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { plan } = (await req.json()) as { plan: PlanId };

      if (!plan || !["starter", "pro", "enterprise"].includes(plan)) {
        return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
      }

      // Obtener la organización y el email del usuario
      const organization =
        await OrganizationService.getOrganizationByClerkId(orgId);

      if (!organization) {
        return NextResponse.json(
          { error: "Organización no encontrada" },
          { status: 404 },
        );
      }

      // Obtener email del admin
      const adminUser = organization.users.find(
        (u) => u.clerk_user_id === userId,
      );
      const payerEmail = adminUser?.email;

      if (!payerEmail) {
        return NextResponse.json(
          { error: "Se necesita un email para crear la suscripción" },
          { status: 400 },
        );
      }

      const result = await BillingService.createSubscription(
        organization.id,
        plan,
        payerEmail,
      );

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status },
        );
      }

      console.error("Error creating subscription:", error);
      return NextResponse.json(
        { error: "Error al crear la suscripción" },
        { status: 500 },
      );
    }
  }

  /**
   * POST /api/billing/cancel
   * Cancela la suscripción activa
   */
  static async cancelSubscription(req: NextRequest) {
    try {
      const { userId, orgId } = await auth();

      if (!userId || !orgId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const organization =
        await OrganizationService.getOrganizationByClerkId(orgId);

      if (!organization) {
        return NextResponse.json(
          { error: "Organización no encontrada" },
          { status: 404 },
        );
      }

      const result = await BillingService.cancelSubscription(organization.id);
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status },
        );
      }

      console.error("Error cancelling subscription:", error);
      return NextResponse.json(
        { error: "Error al cancelar la suscripción" },
        { status: 500 },
      );
    }
  }

  /**
   * GET /api/billing/status
   * Obtiene el estado de la suscripción
   */
  static async getSubscriptionStatus(req: NextRequest) {
    try {
      const { userId, orgId } = await auth();

      if (!userId || !orgId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const organization =
        await OrganizationService.getOrganizationByClerkId(orgId);

      if (!organization) {
        return NextResponse.json(
          { error: "Organización no encontrada" },
          { status: 404 },
        );
      }

      const status = await BillingService.getSubscriptionStatus(
        organization.id,
      );
      return NextResponse.json(status);
    } catch (error) {
      console.error("Error getting subscription status:", error);
      return NextResponse.json(
        { error: "Error al obtener estado de suscripción" },
        { status: 500 },
      );
    }
  }

  /**
   * POST /api/billing/webhook
   * Recibe notificaciones de Mercado Pago
   */
  static async handleWebhook(req: NextRequest) {
    try {
      // Validar firma del webhook (si configuraste secret)
      const webhookSecret = process.env.MP_WEBHOOK_SECRET;
      if (webhookSecret) {
        const xSignature = req.headers.get("x-signature");
        const xRequestId = req.headers.get("x-request-id");

        if (!xSignature || !xRequestId) {
          return NextResponse.json(
            { error: "Missing signature headers" },
            { status: 401 },
          );
        }

        // Parsear x-signature: ts=xxx,v1=xxx
        const parts = Object.fromEntries(
          xSignature.split(",").map((part) => {
            const [key, value] = part.split("=");
            return [key.trim(), value.trim()];
          }),
        );

        const url = new URL(req.url);
        const dataId = url.searchParams.get("data.id") ?? "";

        // Construir string para validar
        const manifest = `id:${dataId};request-id:${xRequestId};ts:${parts.ts};`;
        const hmac = createHmac("sha256", webhookSecret)
          .update(manifest)
          .digest("hex");

        if (hmac !== parts.v1) {
          console.warn("Webhook signature mismatch");
          return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 },
          );
        }
      }

      const body = await req.json();
      const { type, data } = body as {
        type: string;
        data: { id: string };
      };

      console.info(`[MP Webhook] type=${type}, data.id=${data?.id}`);

      switch (type) {
        case "subscription_preapproval":
          await BillingService.handlePreapprovalUpdate(data.id);
          break;

        case "payment":
          await BillingService.handlePaymentUpdate(data.id);
          break;

        default:
          console.info(`[MP Webhook] Tipo no manejado: ${type}`);
      }

      // MP espera un 200/201 para confirmar recepción
      return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
      console.error("Error processing webhook:", error);
      // Devolver 200 igualmente para que MP no reintente indefinidamente
      return NextResponse.json({ received: true }, { status: 200 });
    }
  }
}
