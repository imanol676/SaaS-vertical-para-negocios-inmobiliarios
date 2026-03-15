import { BillingController } from "@/src/lib/controllers/billing.controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return BillingController.createSubscription(req);
}
