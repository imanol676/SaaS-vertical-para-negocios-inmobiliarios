import { BillingController } from "@/src/lib/controllers/billing.controller";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return BillingController.getSubscriptionStatus(req);
}
