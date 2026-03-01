import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreatePropertyRequest,
  CreatePropertyResponse,
} from "../../types/api";

type CreatePropertyPayload = Omit<CreatePropertyRequest, "organizationId"> & {
  organizationId?: string;
};

export const propertiesKeys = {
  all: ["properties"] as const,
  lists: () => [...propertiesKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...propertiesKeys.lists(), filters] as const,
  details: () => [...propertiesKeys.all, "detail"] as const,
  detail: (id: string) => [...propertiesKeys.details(), id] as const,
};

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePropertyPayload) => {
      const response = await fetch("/api/properties/createProperty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create property");
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("La respuesta del servidor no es JSON");
      }

      return response.json() as Promise<CreatePropertyResponse>;
    },
    onSuccess: () => {
      // Invalidar la lista de organizaciones para refrescarla
      queryClient.invalidateQueries({ queryKey: propertiesKeys.lists() });
    },
  });
}
