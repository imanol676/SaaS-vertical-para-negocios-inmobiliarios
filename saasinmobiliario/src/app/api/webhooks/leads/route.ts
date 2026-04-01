import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized. Missing or invalid Bearer token." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const organization = await prisma.organizations.findUnique({
      where: { webhook_key: token },
      select: { id: true, plan_status: true }
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Invalid webhook key" },
        { status: 401 }
      );
    }

    if (organization.plan_status !== "active") {
      return NextResponse.json(
        { error: "Organizations with inactive plans cannot receive webhooks. Please upgrade your plan." },
        { status: 403 }
      );
    }

    const payload = await req.json();

    const {
      name,
      email,
      phone,
      budget,
      zone,
      timeframe,
      property_type,
      source = "Webhook",
    } = payload;

    if (!name) {
      return NextResponse.json(
        { error: "Field 'name' is required" },
        { status: 400 }
      );
    }

    const lead = await prisma.leads.create({
      data: {
        organization_id: organization.id,
        name,
        email: email || null,
        phone: phone || null,
        budget: budget ? Number(budget) : null,
        zone: zone || null,
        timeframe: timeframe || null,
        property_type: property_type || null,
        source: source || "Webhook",
        status: "Nuevo",
        raw_payload: payload,
      },
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the webhook" },
      { status: 500 }
    );
  }
}
