import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface InvitationItem {
  id: string;
  email: string;
  role: string;
  status: string;
  invited_by: string;
  created_at: string;
}

export interface OrgUser {
  id: string;
  clerk_user_id: string;
  organization_id: string;
  role: string;
  email: string | null;
  name: string | null;
  created_at: string;
}

export const invitationKeys = {
  all: ["invitations"] as const,
  list: () => [...invitationKeys.all, "list"] as const,
};

export const orgUsersKeys = {
  all: ["orgUsers"] as const,
  list: () => [...orgUsersKeys.all, "list"] as const,
};

export function useInvitationsList() {
  return useQuery({
    queryKey: invitationKeys.list(),
    queryFn: async () => {
      const response = await fetch("/api/invitations/list");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al listar invitaciones");
      }
      return response.json() as Promise<{ invitations: InvitationItem[] }>;
    },
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/invitations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear invitación");
      }

      return response.json() as Promise<InvitationItem>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.list() });
    },
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await fetch("/api/invitations/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al revocar invitación");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.list() });
    },
  });
}

export function useOrgUsers() {
  return useQuery({
    queryKey: orgUsersKeys.list(),
    queryFn: async () => {
      const response = await fetch("/api/organizations/users");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al listar usuarios");
      }
      return response.json() as Promise<{ users: OrgUser[] }>;
    },
  });
}
