import { NextRequest } from "next/server";
import { AIController } from "@/src/lib/controllers/ai.controller";

export async function POST(req: NextRequest) {
  return AIController.prioritizeLeads(req);
}

export async function GET(req: NextRequest) {
  return AIController.listScoringHistory(req);
}
