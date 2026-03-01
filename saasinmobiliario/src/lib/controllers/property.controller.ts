import { PropertyService } from "../servieces/property.servieces";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export class PropertyController {
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
      console.error("Error creating property:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }
}
