import { InvitationController } from "@/src/lib/controllers/invitation.controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return InvitationController.revokeInvitation(req);
}
