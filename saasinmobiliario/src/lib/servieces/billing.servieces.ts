import prisma from "../prisma";
import {
  getCheckoutUrlFromPreapproval,
  isMercadoPagoTestMode,
  mpPreApproval,
} from "../billing/mercadopago";
import { PlanId, getPlan } from "../billing/plans";
import { ServiceError } from "./organization.serviece";

function getMercadoPagoErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") return "";

  const data = error as Record<string, unknown>;
  if (typeof data.message === "string") return data.message;

  if (typeof data.error === "string") return data.error;

  const cause = data.cause;
  if (Array.isArray(cause) && cause.length > 0) {
    const first = cause[0] as Record<string, unknown>;
    if (typeof first?.description === "string") {
      return first.description;
    }
  }

  return "";
}

function isRealVsTestMismatchError(error: unknown): boolean {
  const message = getMercadoPagoErrorMessage(error).toLowerCase();
  return (
    message.includes("real or test users") ||
    message.includes("both payer and collector")
  );
}

export class BillingService {
  /**
   * Crea una suscripción (preapproval) en Mercado Pago
   * y guarda el registro en la BD.
   */
  static async createSubscription(
    organizationId: string,
    planId: PlanId,
    payerEmail: string,
  ) {
    const plan = getPlan(planId);
    if (!plan) {
      throw new ServiceError("Plan no válido", 400);
    }

    const configuredTestPayerEmail = process.env.MP_TEST_PAYER_EMAIL?.trim();
    const legacyTestUser = process.env.TEST_USER?.trim();
    const fallbackTestPayerEmail = legacyTestUser?.includes("@")
      ? legacyTestUser
      : null;

    const testPayerEmail = configuredTestPayerEmail || fallbackTestPayerEmail;
    const preferredPayerEmail =
      isMercadoPagoTestMode && testPayerEmail ? testPayerEmail : payerEmail;

    // Verificar que no tenga suscripción activa
    const existing = await prisma.subscription.findUnique({
      where: { organization_id: organizationId },
    });

    if (existing?.status === "authorized") {
      throw new ServiceError(
        "Ya existe una suscripción activa. Cancelá la actual antes de cambiar de plan.",
        409,
      );
    }

    if (existing?.status === "pending" && existing.mp_preapproval_id) {
      try {
        const currentPreapproval = await mpPreApproval.get({
          id: existing.mp_preapproval_id,
        });

        const currentMpStatus = currentPreapproval.status ?? "pending";

        const mpPendingPayerEmail =
          typeof currentPreapproval.payer_email === "string"
            ? currentPreapproval.payer_email.toLowerCase()
            : null;
        const expectedPayerEmail = preferredPayerEmail.toLowerCase();
        const canReusePendingCheckout =
          !isMercadoPagoTestMode || mpPendingPayerEmail === expectedPayerEmail;

        if (currentMpStatus === "pending" && canReusePendingCheckout) {
          const pendingCheckoutUrl =
            getCheckoutUrlFromPreapproval(currentPreapproval);

          if (pendingCheckoutUrl) {
            return {
              subscription: existing,
              checkoutUrl: pendingCheckoutUrl,
              reusedCheckout: true,
            };
          }
        }

        const statusMap: Record<string, string> = {
          authorized: "authorized",
          pending: "pending",
          paused: "paused",
          cancelled: "cancelled",
        };

        const syncedStatus = statusMap[currentMpStatus] ?? "pending";

        if (syncedStatus !== existing.status) {
          await prisma.subscription.update({
            where: { id: existing.id },
            data: { status: syncedStatus },
          });
        }

        if (syncedStatus === "authorized") {
          throw new ServiceError(
            "Ya existe una suscripción activa. Cancelá la actual antes de cambiar de plan.",
            409,
          );
        }
      } catch (error) {
        if (error instanceof ServiceError) {
          throw error;
        }
        console.warn(
          `No se pudo reutilizar la suscripción pendiente ${existing.mp_preapproval_id}. Se creará una nueva.`,
          error,
        );
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Mercado Pago no acepta localhost como back_url.
    // En desarrollo usamos una URL de ejemplo que MP acepte; en producción será la URL real.
    const backUrl =
      appUrl.includes("localhost") || appUrl.includes("127.0.0.1")
        ? "https://www.mercadopago.com.ar"
        : `${appUrl}/dashboard?billing=success`;

    const createPreapproval = (payer: string) =>
      mpPreApproval.create({
        body: {
          reason: `${plan.name} - EstateOS`,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: plan.priceARS,
            currency_id: "ARS",
          },
          payer_email: payer,
          back_url: backUrl,
          external_reference: organizationId,
          status: "pending",
        },
      });

    // Crear preapproval en Mercado Pago
    let preapproval: Awaited<ReturnType<typeof createPreapproval>>;

    try {
      preapproval = await createPreapproval(preferredPayerEmail);
    } catch (error) {
      const shouldRetryWithRealPayer =
        preferredPayerEmail.toLowerCase() !== payerEmail.toLowerCase() &&
        isRealVsTestMismatchError(error);

      if (!shouldRetryWithRealPayer) {
        throw error;
      }

      console.warn(
        "Mercado Pago rechazó el payer de prueba por mezcla real/test. Reintentando con payer real.",
      );
      preapproval = await createPreapproval(payerEmail);
    }

    const checkoutUrl = getCheckoutUrlFromPreapproval(preapproval);

    if (!checkoutUrl) {
      throw new ServiceError(
        "Mercado Pago no devolvió una URL de checkout válida",
        502,
      );
    }

    // Guardar o actualizar suscripción en BD
    const subscription = await prisma.subscription.upsert({
      where: { organization_id: organizationId },
      update: {
        mp_preapproval_id: preapproval.id,
        plan: planId,
        status: "pending",
      },
      create: {
        organization_id: organizationId,
        mp_preapproval_id: preapproval.id,
        plan: planId,
        status: "pending",
      },
    });

    return {
      subscription,
      checkoutUrl, // URL para que el usuario pague
    };
  }

  /**
   * Cancela la suscripción activa
   */
  static async cancelSubscription(organizationId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { organization_id: organizationId },
    });

    if (!subscription || !subscription.mp_preapproval_id) {
      throw new ServiceError("No se encontró suscripción activa", 404);
    }

    // Cancelar en Mercado Pago
    await mpPreApproval.update({
      id: subscription.mp_preapproval_id,
      body: { status: "cancelled" },
    });

    // Actualizar en BD
    await prisma.subscription.update({
      where: { organization_id: organizationId },
      data: { status: "cancelled" },
    });

    // Marcar plan como inactivo en la organización
    await prisma.organizations.update({
      where: { id: organizationId },
      data: { plan_status: "cancelled" },
    });

    return { success: true };
  }

  /**
   * Obtiene el estado de la suscripción de una organización
   */
  static async getSubscriptionStatus(organizationId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { organization_id: organizationId },
    });

    if (!subscription) {
      return { status: "none", plan: null };
    }

    return {
      status: subscription.status,
      plan: subscription.plan,
      nextPaymentDate: subscription.next_payment_date,
    };
  }

  /**
   * Procesa un webhook de Mercado Pago (preapproval actualizado)
   */
  static async handlePreapprovalUpdate(preapprovalId: string) {
    // Obtener estado actualizado desde MP
    const preapproval = await mpPreApproval.get({ id: preapprovalId });

    const subscription = await prisma.subscription.findUnique({
      where: { mp_preapproval_id: preapprovalId },
    });

    if (!subscription) {
      console.warn(
        `Suscripción no encontrada para preapproval: ${preapprovalId}`,
      );
      return;
    }

    const mpStatus = preapproval.status ?? "pending";

    // Mapear estado de MP a nuestro estado
    const statusMap: Record<string, string> = {
      authorized: "authorized",
      pending: "pending",
      paused: "paused",
      cancelled: "cancelled",
    };

    const newStatus = statusMap[mpStatus] ?? "pending";

    // Actualizar suscripción
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: newStatus,
        mp_payer_id:
          preapproval.payer_id?.toString() ?? subscription.mp_payer_id,
        next_payment_date: preapproval.next_payment_date
          ? new Date(preapproval.next_payment_date)
          : undefined,
      },
    });

    // Actualizar plan_status en la organización
    const orgPlanStatus = newStatus === "authorized" ? "active" : newStatus;

    await prisma.organizations.update({
      where: { id: subscription.organization_id },
      data: {
        plan: subscription.plan,
        plan_status: orgPlanStatus,
        trial_ends_at: newStatus === "authorized" ? null : undefined,
      },
    });
  }

  /**
   * Procesa un webhook de pago
   */
  static async handlePaymentUpdate(paymentId: string) {
    const { mpPayment } = await import("../billing/mercadopago");
    const payment = await mpPayment.get({ id: paymentId });

    if (!payment.id) return;

    // Buscar la organización por el preapproval_id del pago
    const preapprovalId = (payment as unknown as Record<string, unknown>)
      .preapproval_id as string | undefined;

    let organizationId: string | null = null;

    if (preapprovalId) {
      const subscription = await prisma.subscription.findUnique({
        where: { mp_preapproval_id: preapprovalId },
      });
      organizationId = subscription?.organization_id ?? null;
    }

    if (!organizationId) {
      console.warn(
        `No se pudo asociar el pago ${paymentId} a una organización`,
      );
      return;
    }

    // Registrar el pago
    await prisma.payment.upsert({
      where: { mp_payment_id: payment.id.toString() },
      update: {
        status: payment.status ?? "pending",
        amount: payment.transaction_amount ?? 0,
        payment_method: payment.payment_type_id ?? null,
      },
      create: {
        organization_id: organizationId,
        mp_payment_id: payment.id.toString(),
        amount: payment.transaction_amount ?? 0,
        currency: payment.currency_id ?? "ARS",
        status: payment.status ?? "pending",
        payment_method: payment.payment_type_id ?? null,
        description: payment.description ?? null,
      },
    });
  }
}
