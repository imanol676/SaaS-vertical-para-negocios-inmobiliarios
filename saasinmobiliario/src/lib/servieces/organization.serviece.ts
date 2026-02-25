import prisma from "../prisma";
import { clerkClient } from "../clerck";

interface CreateOrganizationInput {
  plan: string;
  clerkUserId: string; // ID de Clerk del usuario que crea la organización
  clerkOrgId: string;
}

interface OrganizationResponse {
  id: string;
  name: string;
  plan: string;
  clerk_org_id: string;
  created_at: Date;
}

type ClerkLikeError = {
  clerkError?: boolean;
  status?: number;
  errors?: Array<{ message?: string; longMessage?: string }>;
  message?: string;
};

export class ServiceError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
  }
}

const isClerkLikeError = (error: unknown): error is ClerkLikeError => {
  return !!error && typeof error === "object" && "clerkError" in error;
};

export class OrganizationService {
  // crear organización con transacción y manejo de errores
  static async createOrganization(
    input: CreateOrganizationInput,
  ): Promise<OrganizationResponse> {
    const { plan, clerkUserId, clerkOrgId } = input;

    try {
      const client = await clerkClient();

      // 1. Obtener organización activa desde Clerk
      const clerkOrg = await client.organizations.getOrganization({
        organizationId: clerkOrgId,
      });
      const organizationName = clerkOrg.name;

      // 2. Calcular fecha de fin de trial (14 días por defecto)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      // 3. Sincronizar organización en la base de datos junto con el usuario
      const organization = await prisma.$transaction(
        async (tx: typeof prisma) => {
          const existingOrg = await tx.organizations.findUnique({
            where: { clerk_org_id: clerkOrg.id },
          });

          const newOrg = existingOrg
            ? await tx.organizations.update({
                where: { id: existingOrg.id },
                data: {
                  name: organizationName,
                  plan,
                  plan_status: existingOrg.plan_status || "trial",
                  trial_ends_at: existingOrg.trial_ends_at ?? trialEndsAt,
                },
              })
            : await tx.organizations.create({
                data: {
                  clerk_org_id: clerkOrg.id,
                  name: organizationName,
                  plan,
                  plan_status: "trial",
                  trial_ends_at: trialEndsAt,
                },
              });

          // Crear usuario asociado a la organización
          await tx.users.upsert({
            where: { clerk_user_id: clerkUserId },
            update: { organization_id: newOrg.id },
            create: {
              clerk_user_id: clerkUserId,
              organization_id: newOrg.id,
            },
          });

          return newOrg;
        },
      );

      // 4. Actualizar los metadatos del usuario en Clerk
      await client.users.updateUserMetadata(clerkUserId, {
        publicMetadata: {
          organizationId: organization.id,
          role: "owner",
          onboardingComplete: true,
        },
      });

      return {
        id: organization.id,
        name: organization.name,
        plan: organization.plan,
        clerk_org_id: organization.clerk_org_id,
        created_at: organization.created_at,
      };
    } catch (error) {
      console.error("Error al crear organización:", error);

      if (isClerkLikeError(error)) {
        const clerkStatus = error.status ?? 500;
        const clerkMessage =
          error.errors?.[0]?.longMessage ||
          error.errors?.[0]?.message ||
          error.message ||
          "Error al crear la organización en Clerk";

        if (clerkStatus === 403) {
          throw new ServiceError(
            "Clerk rechazó la creación de organización (403). Verifica en Clerk Dashboard que la creación de organizaciones esté habilitada para usuarios autenticados.",
            403,
          );
        }

        throw new ServiceError(clerkMessage, clerkStatus);
      }

      throw new ServiceError(
        error instanceof Error
          ? error.message
          : "Error al crear la organización",
        500,
      );
    }
  }

  /**
   * Obtiene una organización por su ID de Clerk
   */
  static async getOrganizationByClerkId(clerkOrgId: string) {
    return await prisma.organizations.findUnique({
      where: { clerk_org_id: clerkOrgId },
      include: {
        users: true,
        properties: true,
        leads: true,
      },
    });
  }

  /**
   * Obtiene una organización por su ID
   */
  static async getOrganizationById(id: string) {
    return await prisma.organizations.findUnique({
      where: { id },
      include: {
        users: true,
        properties: {
          take: 10,
          orderBy: { created_at: "desc" },
        },
        leads: {
          take: 10,
          orderBy: { created_at: "desc" },
        },
      },
    });
  }

  /**
   * Actualiza el plan de una organización
   */
  static async updateOrganizationPlan(
    organizationId: string,
    plan: string,
    planStatus: string = "active",
  ) {
    return await prisma.organizations.update({
      where: { id: organizationId },
      data: {
        plan,
        plan_status: planStatus,
        // Si actualizan a un plan de pago, remover fecha de trial
        trial_ends_at: planStatus === "active" ? null : undefined,
      },
    });
  }

  /**
   * Agrega un usuario existente a una organización
   */
  static async addUserToOrganization(
    clerkUserId: string,
    organizationId: string,
  ) {
    // Verificar que la organización existe
    const organization = await prisma.organizations.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error("Organización no encontrada");
    }

    // Crear el usuario en la base de datos
    const user = await prisma.users.create({
      data: {
        clerk_user_id: clerkUserId,
        organization_id: organizationId,
      },
    });

    // Agregar el usuario a la organización en Clerk
    const client = await clerkClient();
    await client.organizations.createOrganizationMembership({
      organizationId: organization.clerk_org_id,
      userId: clerkUserId,
      role: "org:member",
    });

    // Actualizar metadatos del usuario
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        organizationId: organizationId,
        role: "member",
        onboardingComplete: true,
      },
    });

    return user;
  }

  /**
   * Obtiene todas las organizaciones (para admin)
   */
  static async getAllOrganizations(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [organizations, total] = await Promise.all([
      prisma.organizations.findMany({
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          _count: {
            select: {
              users: true,
              properties: true,
              leads: true,
            },
          },
        },
      }),
      prisma.organizations.count(),
    ]);

    return {
      organizations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Eliminar una organización (solo para admin)
  static async deleteOrganization(organizationId: string) {
    // Primero eliminar la organización en Clerk
    const organization = await prisma.organizations.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error("Organización no encontrada");
    }

    const client = await clerkClient();
    await client.organizations.deleteOrganization(organization.clerk_org_id);

    // Luego eliminar la organización en la base de datos
    return await prisma.organizations.delete({
      where: { id: organizationId },
    });
  }

  /**
   * Actualiza la información general de una organización
   */
  static async updateOrganization(
    organizationId: string,
    data: {
      name?: string;
      plan?: string;
      planStatus?: string;
    },
  ) {
    const organization = await prisma.organizations.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error("Organización no encontrada");
    }

    // Si se actualiza el nombre, también actualizarlo en Clerk
    if (data.name) {
      const client = await clerkClient();
      await client.organizations.updateOrganization(organization.clerk_org_id, {
        name: data.name,
      });
    }

    // Actualizar en la base de datos
    return await prisma.organizations.update({
      where: { id: organizationId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.plan && { plan: data.plan }),
        ...(data.planStatus && { plan_status: data.planStatus }),
      },
    });
  }
}
