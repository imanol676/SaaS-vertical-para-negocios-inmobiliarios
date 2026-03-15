import { InvitationController } from "@/src/lib/controllers/invitation.controller";

export async function GET() {
  return InvitationController.listUsers();
}
