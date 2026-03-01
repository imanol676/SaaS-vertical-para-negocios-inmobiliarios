import { Prisma } from "@prisma/client";
import prisma from "../prisma";

interface PropertyInput {
  title: string;
  type: string;
  price: number;
  location: string;
  status: string;
  clerk_org_id: string;
}

interface UpdatePropertyInput {
  id: string;
  clerk_org_id: string;
  title?: string;
  type?: string;
  price?: number;
  location?: string;
  status?: string;
}

type SerializableProperty = {
  id: string;
  organization_id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  status: string;
  created_at: Date;
  updated_at: Date;
};

export class PropertyService {
  private static serializeProperty(property: {
    id: string;
    organization_id: string;
    title: string;
    type: string;
    price: Prisma.Decimal;
    location: string;
    status: string;
    created_at: Date;
    updated_at: Date;
  }): SerializableProperty {
    return {
      ...property,
      price: Number(property.price),
    };
  }
  // Método privado para resolver el ID de la organización a partir del clerk_org_id
  private static async resolveOrganizationIdByClerkId(clerk_org_id: string) {
    const organization = await prisma.organizations.findUnique({
      where: { clerk_org_id },
      select: { id: true },
    });

    if (!organization) {
      throw new Error("Organización no encontrada");
    }

    return organization.id;
  }
  // Método para crear una nueva propiedad
  static async createProperty(
    input: PropertyInput,
  ): Promise<SerializableProperty> {
    const { clerk_org_id, ...propertyData } = input;
    const organizationId =
      await PropertyService.resolveOrganizationIdByClerkId(clerk_org_id);

    const property = await prisma.properties.create({
      data: {
        ...propertyData,
        price: new Prisma.Decimal(propertyData.price),
        organization: {
          connect: { id: organizationId },
        },
      },
    });

    return PropertyService.serializeProperty(property);
  }

  // Método para listar propiedades filtradas por organización
  static async listarPropiedadesPorOrganizacion(
    clerk_org_id: string,
  ): Promise<SerializableProperty[]> {
    const organizationId =
      await PropertyService.resolveOrganizationIdByClerkId(clerk_org_id);

    const properties = await prisma.properties.findMany({
      where: { organization_id: organizationId },
      orderBy: { created_at: "desc" },
    });

    return properties.map(PropertyService.serializeProperty);
  }

  // Método para obtener una propiedad por su ID sin filtrar por organización
  static async obtenerPropiedadPorId(
    id: string,
  ): Promise<SerializableProperty> {
    const property = await prisma.properties.findUnique({
      where: { id },
    });

    if (!property) {
      throw new Error("Propiedad no encontrada");
    }

    return PropertyService.serializeProperty(property);
  }

  // Método para obtener una propiedad por ID filtrada por organización
  static async obtenerPropiedadPorIdEnOrganizacion(
    id: string,
    clerk_org_id: string,
  ): Promise<SerializableProperty> {
    const organizationId =
      await PropertyService.resolveOrganizationIdByClerkId(clerk_org_id);

    const property = await prisma.properties.findFirst({
      where: { id, organization_id: organizationId },
    });

    if (!property) {
      throw new Error("Propiedad no encontrada");
    }

    return PropertyService.serializeProperty(property);
  }

  // Método para listar todas las propiedades sin filtrar por organización
  static async listarPropiedades(): Promise<SerializableProperty[]> {
    const properties = await prisma.properties.findMany({
      orderBy: { created_at: "desc" },
    });

    return properties.map(PropertyService.serializeProperty);
  }

  // Método para actualizar una propiedad existente
  static async updateProperty(
    input: UpdatePropertyInput,
  ): Promise<SerializableProperty> {
    const { id, clerk_org_id, ...changes } = input;
    const organizationId =
      await PropertyService.resolveOrganizationIdByClerkId(clerk_org_id);

    const existing = await prisma.properties.findFirst({
      where: { id, organization_id: organizationId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Propiedad no encontrada");
    }

    const hasChanges = Object.values(changes).some(
      (value) => value !== undefined,
    );
    if (!hasChanges) {
      throw new Error("No hay campos para actualizar");
    }

    const data: Prisma.PropertiesUpdateInput = {};

    if (changes.title !== undefined) data.title = changes.title;
    if (changes.type !== undefined) data.type = changes.type;
    if (changes.location !== undefined) data.location = changes.location;
    if (changes.status !== undefined) data.status = changes.status;
    if (changes.price !== undefined) {
      data.price = new Prisma.Decimal(changes.price);
    }

    const property = await prisma.properties.update({
      where: { id },
      data,
    });

    return PropertyService.serializeProperty(property);
  }

  // Método para eliminar una propiedad por su ID
  static async eliminarPropiedad(id: string): Promise<SerializableProperty> {
    const property = await prisma.properties.delete({
      where: { id },
    });

    return PropertyService.serializeProperty(property);
  }

  // Método para eliminar una propiedad por su ID filtrada por organización
  static async eliminarPropiedadEnOrganizacion(
    id: string,
    clerk_org_id: string,
  ): Promise<SerializableProperty> {
    const organizationId =
      await PropertyService.resolveOrganizationIdByClerkId(clerk_org_id);

    const existing = await prisma.properties.findFirst({
      where: { id, organization_id: organizationId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Propiedad no encontrada");
    }

    const property = await prisma.properties.delete({
      where: { id },
    });

    return PropertyService.serializeProperty(property);
  }
}
