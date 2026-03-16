import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { UserParametersService } from "../servieces/userParameters";

export class LeadsConfigController {
  static async createOrUpdate(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const body = await req.json();
      const config = await UserParametersService.createLeadConfig(body, userId);
      return NextResponse.json(config);
    } catch (error) {
      console.error("Error creating/updating lead config:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }

  static async getConfig(_req: NextRequest) {
    void _req;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const config = await UserParametersService.getLeadConfigByUserId(userId);
      return NextResponse.json(config);
    } catch (error) {
      console.error("Error fetching lead config:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }
}
