import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Organization,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  UpdateOrganizationRequest,
  UpdatePlanRequest,
  AddUserToOrganizationRequest,
  ListOrganizationsResponse,
} from "@/src/types/api";

// Keys para el query cache
export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...organizationKeys.lists(), filters] as const,
  details: () => [...organizationKeys.all, "detail"] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  byClerkId: (clerkId: string) =>
    [...organizationKeys.all, "clerk", clerkId] as const,
};

// ========== QUERIES ==========

/**
 * Hook para obtener una organización por su ID
 */
export function useOrganization(organizationId: string | null) {
  return useQuery({
    queryKey: organizationKeys.detail(organizationId || ""),
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID is required");

      const response = await fetch(
        `/api/organizations/getOrganization/${organizationId}?id=${organizationId}`,
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch organization");
      }

      return response.json() as Promise<Organization>;
    },
    enabled: !!organizationId, // Solo ejecutar si hay ID
  });
}

/**
 * Hook para obtener una organización por su Clerk ID
 */
export function useOrganizationByClerkId(clerkOrgId: string | null) {
  return useQuery({
    queryKey: organizationKeys.byClerkId(clerkOrgId || ""),
    queryFn: async () => {
      if (!clerkOrgId) throw new Error("Clerk Organization ID is required");

      const response = await fetch(
        `/api/organizations/getByClerkId?clerkOrgId=${clerkOrgId}`,
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch organization");
      }

      return response.json() as Promise<Organization>;
    },
    enabled: !!clerkOrgId,
  });
}

/**
 * Hook para listar todas las organizaciones
 */
export function useOrganizations(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: organizationKeys.list({ page, limit }),
    queryFn: async () => {
      const response = await fetch(
        `/api/organizations/list?page=${page}&limit=${limit}`,
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch organizations");
      }

      return response.json() as Promise<ListOrganizationsResponse>;
    },
  });
}

// ========== MUTATIONS ==========

/**
 * Hook para crear una nueva organización
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrganizationRequest) => {
      const response = await fetch("/api/organizations/createOrganization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const payload = (await response.json()) as {
            error?: string;
            details?: string;
          };
          throw new Error(
            payload.details || payload.error || `Error ${response.status}`,
          );
        }

        const text = await response.text();
        throw new Error(`Error ${response.status}: ${text.substring(0, 200)}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("La respuesta del servidor no es JSON");
      }

      return response.json() as Promise<CreateOrganizationResponse>;
    },
    onSuccess: () => {
      // Invalidar la lista de organizaciones para refrescarla
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar una organización
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateOrganizationRequest) => {
      const response = await fetch(
        `/api/organizations/update/${data.organizationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update organization");
      }

      return response.json() as Promise<Organization>;
    },
    onSuccess: (data) => {
      // Invalidar el detalle de la organización actualizada
      queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar el plan de una organización
 */
export function useUpdateOrganizationPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePlanRequest) => {
      const response = await fetch(`/api/organizations/upgradePlan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update plan");
      }

      return response.json() as Promise<Organization>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

/**
 * Hook para agregar un usuario a una organización
 */
export function useAddUserToOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddUserToOrganizationRequest) => {
      const response = await fetch("/api/organizations/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add user to organization");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar la organización para refrescar la lista de usuarios
      queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(variables.organizationId),
      });
    },
  });
}

/**
 * Hook para eliminar una organización
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (organizationId: string) => {
      const response = await fetch(
        `/api/organizations/delete/${organizationId}?id=${organizationId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete organization");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar toda la lista de organizaciones
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}
