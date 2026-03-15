import { PropertyService } from "../servieces/property.servieces";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkPlanLimit, PlanLimitError } from "../billing/checkLimits";
import prisma from "../prisma";

export class PropertyController {
  // Método para crear una nueva propiedad
  static async createProperty(req: NextRequest) {
    try {
      const body = await req.json();
      const { userId, orgId } = await auth();
      const { title, type, price, location, status } = body;
      const parsedPrice = Number(price);

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

      if (!title || !type || price == null || !location || !status) {
        console.error("Campos faltantes:", {
          title,
          type,
          price,
          location,
          status,
        });
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }

      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json(
          { error: "El precio debe ser un número válido" },
          { status: 400 },
        );
      }

      // Verificar límites del plan
      const org = await prisma.organizations.findUnique({
        where: { clerk_org_id: orgId },
        select: { id: true },
      });

      if (!org) {
        return NextResponse.json(
          { error: "Organización no encontrada" },
          { status: 404 },
        );
      }

      await checkPlanLimit(org.id, "properties");

      const property = await PropertyService.createProperty({
        title,
        type,
        price: parsedPrice,
        location,
        status,
        clerk_org_id: orgId,
      });
      return NextResponse.json(property, { status: 201 });
    } catch (error) {
      if (error instanceof PlanLimitError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status },
        );
      }
      console.error("Error creating property:", error);

      const message = error instanceof Error ? error.message : "Unknown error";
      if (message === "Organización no encontrada") {
        return NextResponse.json({ error: message }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }

  // Método para actualizar una propiedad existente
  static async updateProperty(req: NextRequest, propertyId: string) {
    try {
      const { userId, orgId } = await auth();

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

      if (!propertyId) {
        return NextResponse.json(
          { error: "Property ID is required" },
          { status: 400 },
        );
      }

      const body = await req.json();
      const { title, type, price, location, status } = body;

      const hasAnyField =
        title !== undefined ||
        type !== undefined ||
        price !== undefined ||
        location !== undefined ||
        status !== undefined;

      if (!hasAnyField) {
        return NextResponse.json(
          { error: "No hay campos para actualizar" },
          { status: 400 },
        );
      }

      const parsedPrice =
        price !== undefined && price !== null ? Number(price) : undefined;

      if (
        parsedPrice !== undefined &&
        (Number.isNaN(parsedPrice) || parsedPrice < 0)
      ) {
        return NextResponse.json(
          { error: "El precio debe ser un número válido" },
          { status: 400 },
        );
      }

      const property = await PropertyService.updateProperty({
        id: propertyId,
        clerk_org_id: orgId,
        title,
        type,
        price: parsedPrice,
        location,
        status,
      });

      return NextResponse.json(property, { status: 200 });
    } catch (error) {
      console.error("Error updating property:", error);

      const message = error instanceof Error ? error.message : "Unknown error";

      if (message === "Organización no encontrada") {
        return NextResponse.json({ error: message }, { status: 404 });
      }

      if (message === "Propiedad no encontrada") {
        return NextResponse.json({ error: message }, { status: 404 });
      }

      if (message === "No hay campos para actualizar") {
        return NextResponse.json({ error: message }, { status: 400 });
      }

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }

  // Método para listar propiedades de la organización activa
  static async listProperties() {
    try {
      const { userId, orgId } = await auth();

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

      const properties =
        await PropertyService.listarPropiedadesPorOrganizacion(orgId);

      return NextResponse.json(properties, { status: 200 });
    } catch (error) {
      console.error("Error listing properties:", error);

      const message = error instanceof Error ? error.message : "Unknown error";
      if (message === "Organización no encontrada") {
        return NextResponse.json({ error: message }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }

  // Método para obtener una propiedad por ID dentro de la organización activa
  static async getPropertyById(propertyId: string) {
    try {
      const { userId, orgId } = await auth();

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

      if (!propertyId) {
        return NextResponse.json(
          { error: "Property ID is required" },
          { status: 400 },
        );
      }

      const property =
        await PropertyService.obtenerPropiedadPorIdEnOrganizacion(
          propertyId,
          orgId,
        );

      return NextResponse.json(property, { status: 200 });
    } catch (error) {
      console.error("Error getting property by id:", error);

      const message = error instanceof Error ? error.message : "Unknown error";
      if (message === "Organización no encontrada") {
        return NextResponse.json({ error: message }, { status: 404 });
      }

      if (message === "Propiedad no encontrada") {
        return NextResponse.json({ error: message }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }

  // Método para eliminar una propiedad por ID dentro de la organización activa
  static async deleteProperty(propertyId: string) {
    try {
      const { userId, orgId } = await auth();

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

      if (!propertyId) {
        return NextResponse.json(
          { error: "Property ID is required" },
          { status: 400 },
        );
      }

      const property = await PropertyService.eliminarPropiedadEnOrganizacion(
        propertyId,
        orgId,
      );

      return NextResponse.json(property, { status: 200 });
    } catch (error) {
      console.error("Error deleting property:", error);

      const message = error instanceof Error ? error.message : "Unknown error";
      if (message === "Organización no encontrada") {
        return NextResponse.json({ error: message }, { status: 404 });
      }

      if (message === "Propiedad no encontrada") {
        return NextResponse.json({ error: message }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }
}
