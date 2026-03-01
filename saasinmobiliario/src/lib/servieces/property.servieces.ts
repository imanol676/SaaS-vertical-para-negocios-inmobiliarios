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

export class PropertyService {
  static async createProperty(input: PropertyInput) {
    const { clerk_org_id, ...propertyData } = input;

    // Verificar que la organización exista usando su ID de Clerk
    const organization = await prisma.organizations.findUnique({
      where: { clerk_org_id },
    });

    if (!organization) {
      throw new Error("Organización no encontrada");
    }

    // Crear la propiedad asociada a la organización
    const property = await prisma.properties.create({
      data: {
        ...propertyData,
        price: new Prisma.Decimal(propertyData.price),
        organization: {
          connect: { id: organization.id },
        },
      },
    });

    return {
      ...property,
      price: Number(property.price),
    };
  }
}
