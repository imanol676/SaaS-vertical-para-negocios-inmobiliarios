import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type LeadVariableWeights = {
  budget: number;
  zone: number;
  timeframe: number;
  source: number;
};

export type LeadConfig = {
  id: string;
  userId: string;
  weights: LeadVariableWeights;
  idealBudget: number;
  minimumBudget: number;
  optimumBudget: number;
  timeframeIdeal: string;
  priorityZones: string[];
  createdAt: string;
  updatedAt: string;
};

export type SaveLeadConfigPayload = {
  weights: LeadVariableWeights;
  idealBudget: number;
  minimumBudget: number;
  optimumBudget: number;
  timeframeIdeal: string;
  priorityZones: string[];
};

export const leadConfigKeys = {
  all: ["lead-config"] as const,
  detail: (scope: string = "me") => [...leadConfigKeys.all, scope] as const,
};

export function useLeadConfig(scope: string = "me") {
  return useQuery({
    queryKey: leadConfigKeys.detail(scope),
    queryFn: async () => {
      const response = await fetch(`/api/leadsConfigs/getConfig/${scope}`, {
        method: "GET",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "No se pudo obtener la configuración de leads",
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("La respuesta del servidor no es JSON");
      }

      return response.json() as Promise<LeadConfig | null>;
    },
  });
}

export function useSaveLeadConfig(scope: string = "me") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveLeadConfigPayload) => {
      const response = await fetch("/api/leadsConfigs/createConfig", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "No se pudo guardar la configuración de leads",
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("La respuesta del servidor no es JSON");
      }

      return response.json() as Promise<LeadConfig>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(leadConfigKeys.detail(scope), data);
      queryClient.invalidateQueries({ queryKey: leadConfigKeys.all });
    },
  });
}
