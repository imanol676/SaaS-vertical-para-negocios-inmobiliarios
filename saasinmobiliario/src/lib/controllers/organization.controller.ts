import { OrganizationService } from "../servieces/organization.serviece";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ServiceError } from "../servieces/organization.serviece";
import { checkPlanLimit, PlanLimitError } from "../billing/checkLimits";

export class OrganizationController {
  // controlador para crear organización con validación de entrada y manejo de errores
  static async createOrganization(req: NextRequest) {
    try {
      const body = await req.json();

      const { userId, orgId } = await auth();
      const { plan } = body;

      //validación de datos de entrada
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!orgId) {
        return NextResponse.json(
          {
            error:
              "No hay organización activa en Clerk. Completa primero el formulario de creación de organización de Clerk.",
          },
          { status: 400 },
        );
      }

      if (!plan) {
        console.error("Campos faltantes:", { plan, userId, orgId });
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }

      // validar que el plan sea uno de los permitidos
      const allowedPlans = ["basic", "pro", "enterprise", "starter"];
      if (!allowedPlans.includes(plan.toLowerCase())) {
        console.error("Plan inválido:", plan);
        return NextResponse.json(
          { error: "Invalid plan type" },
          { status: 400 },
        );
      }

      const organization = await OrganizationService.createOrganization({
        plan,
        clerkUserId: userId,
        clerkOrgId: orgId,
      });
      return NextResponse.json(organization, { status: 201 });
    } catch (error) {
      console.error("Error creating organization:", error);

      if (error instanceof ServiceError) {
        return NextResponse.json(
          {
            error: "Failed to create organization",
            details:
              process.env.NODE_ENV === "development"
                ? error.message
                : undefined,
          },
          { status: error.status },
        );
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error details:", errorMessage);
      return NextResponse.json(
        {
          error: "Failed to create organization",
          details:
            process.env.NODE_ENV === "development" ? errorMessage : undefined,
        },
        { status: 500 },
      );
    }
  }

  // controlador para obtener detalles de una organización por ID
  static async getOrganization(req: NextRequest) {
    try {
      const { userId, orgId: clerkOrgId } = await auth();
      if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { searchParams } = new URL(req.url);
      const orgId = searchParams.get("id");

      if (!orgId) {
        return NextResponse.json(
          { error: "Organization ID is required" },
          { status: 400 },
        );
      }

      const organization = await OrganizationService.getOrganizationById(orgId);

      // Verify the user belongs to this org
      if (organization?.clerk_org_id !== clerkOrgId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (!organization) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(organization, { status: 200 });
    } catch (error) {
      console.error("Error fetching organization:", error);
      return NextResponse.json(
        { error: "Failed to fetch organization" },
        { status: 500 },
      );
    }
  }

  // controlador para actualizar el plan de una organización
  static async updateOrganizationPlan(req: NextRequest) {
    try {
      const { userId, orgId: activeOrgId } = await auth();
      if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { organizationId, plan, planStatus } = await req.json();

      if (!organizationId || !plan) {
        return NextResponse.json(
          { error: "Organization ID and plan are required" },
          { status: 400 },
        );
      }

      const targetOrg =
        await OrganizationService.getOrganizationById(organizationId);
      if (targetOrg?.clerk_org_id !== activeOrgId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (planStatus && !["active", "inactive"].includes(planStatus)) {
        return NextResponse.json(
          { error: "Invalid plan status" },
          { status: 400 },
        );
      }

      const updatedPlan = await OrganizationService.updateOrganizationPlan(
        organizationId,
        plan,
        planStatus,
      );

      return NextResponse.json(updatedPlan, { status: 200 });
    } catch (error) {
      console.error("Error updating organization plan:", error);
      return NextResponse.json(
        { error: "Failed to update organization plan" },
        { status: 500 },
      );
    }
  }

  // Obtener organización por ID de Clerk
  static async getOrganizationByClerkId(req: NextRequest) {
    try {
      const { userId, orgId: activeOrgId } = await auth();
      if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { searchParams } = new URL(req.url);
      const clerkOrgId = searchParams.get("clerkOrgId");
      if (!clerkOrgId) {
        return NextResponse.json("clerkOrgId is required", { status: 400 });
      }

      if (clerkOrgId !== activeOrgId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const organization =
        await OrganizationService.getOrganizationByClerkId(clerkOrgId);

      return NextResponse.json(organization, { status: 200 });
    } catch (error) {
      console.error("Error fetching organization by Clerk ID:", error);
      return NextResponse.json(
        { error: "Failed to fetch organization by Clerk ID" },
        { status: 500 },
      );
    }
  }

  //Agregar usuario a organización
  static async addUserToOrganization(req: NextRequest) {
    try {
      const { userId, orgId: activeOrgId } = await auth();
      if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { organizationId, clerkUserId } = await req.json();

      if (!organizationId || !clerkUserId) {
        return NextResponse.json(
          { error: "Organization ID and Clerk User ID are required" },
          { status: 400 },
        );
      }

      const targetOrg =
        await OrganizationService.getOrganizationById(organizationId);
      if (targetOrg?.clerk_org_id !== activeOrgId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Verificar límite de usuarios del plan
      await checkPlanLimit(organizationId, "users");

      const newUser = await OrganizationService.addUserToOrganization(
        clerkUserId,
        organizationId,
      );

      return NextResponse.json(newUser, { status: 200 });
    } catch (error) {
      if (error instanceof PlanLimitError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status },
        );
      }
      console.error("Error adding user to organization:", error);
      return NextResponse.json(
        { error: "Failed to add user to organization" },
        { status: 500 },
      );
    }
  }

  // Listar todas las organizaciones (para admin)
  static async listOrganizations(_req: NextRequest) {
    void _req;
    try {
      const { userId } = await auth();
      if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      // OJO: Esta ruta requiere privilegios de superadmin si lista TODAS las organizaciones.
      // Por ahora, solo pedimos que esté autenticado.
      const organizations = await OrganizationService.getAllOrganizations();
      return NextResponse.json(organizations, { status: 200 });
    } catch (error) {
      console.error("Error listing organizations:", error);
      return NextResponse.json(
        { error: "Failed to list organizations" },
        { status: 500 },
      );
    }
  }

  // Eliminar organización
  static async deleteOrganization(req: NextRequest) {
    try {
      const { userId, orgId: activeOrgId } = await auth();
      if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { searchParams } = new URL(req.url);
      const orgId = searchParams.get("id");

      if (!orgId) {
        return NextResponse.json(
          { error: "Organization ID is required" },
          { status: 400 },
        );
      }

      const targetOrg = await OrganizationService.getOrganizationById(orgId);
      if (targetOrg?.clerk_org_id !== activeOrgId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await OrganizationService.deleteOrganization(orgId);
      return NextResponse.json(
        { message: "Organization deleted successfully" },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error deleting organization:", error);
      return NextResponse.json(
        { error: "Failed to delete organization" },
        { status: 500 },
      );
    }
  }

  // Actualizar información general de organización
  static async updateOrganization(req: NextRequest) {
    try {
      const { userId, orgId: activeOrgId } = await auth();
      if (!userId)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { organizationId, name, plan, planStatus } = await req.json();

      if (!organizationId) {
        return NextResponse.json(
          { error: "Organization ID is required" },
          { status: 400 },
        );
      }

      const targetOrg =
        await OrganizationService.getOrganizationById(organizationId);
      if (targetOrg?.clerk_org_id !== activeOrgId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Validar plan si se proporciona
      if (plan) {
        const allowedPlans = ["basic", "pro", "enterprise"];
        if (!allowedPlans.includes(plan)) {
          return NextResponse.json(
            { error: "Invalid plan type" },
            { status: 400 },
          );
        }
      }

      // Validar plan status si se proporciona
      if (planStatus && !["active", "inactive", "trial"].includes(planStatus)) {
        return NextResponse.json(
          { error: "Invalid plan status" },
          { status: 400 },
        );
      }

      const updatedOrganization = await OrganizationService.updateOrganization(
        organizationId,
        { name, plan, planStatus },
      );

      return NextResponse.json(updatedOrganization, { status: 200 });
    } catch (error) {
      console.error("Error updating organization:", error);
      return NextResponse.json(
        { error: "Failed to update organization" },
        { status: 500 },
      );
    }
  }
}
