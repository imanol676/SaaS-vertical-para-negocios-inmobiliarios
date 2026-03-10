import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type LeadProperty = {
  id: string;
  title: string;
  type: string;
  location: string;
};

export type LeadItem = {
  id: string;
  property_id: string | null;
  source: string;
  name: string;
  email: string | null;
  phone: string | null;
  budget: number | null;
  zone: string | null;
  timeframe: string | null;
  property_type: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  latest_score: { score: number; label: string } | null;
  property: LeadProperty | null;
};

export type AssignPropertyPayload = {
  leadId: string;
  propertyId: string | null;
};

export type ImportLeadsPayload = {
  spreadsheetId: string;
  range?: string;
  source?: string;
  defaultStatus?: string;
};

export type ImportLeadsResponse = {
  leads: LeadItem[];
  summary: {
    totalRows: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  errors: Array<{ row: number; reason: string }>;
};

export type PrioritizeLeadsPayload = {
  leadIds?: string[];
  maxLeads?: number;
};

export type PrioritizedLeadItem = {
  leadId: string;
  score: number;
  label: string;
  explanation: unknown;
};

export type PrioritizeLeadsResponse = {
  processed: number;
  succeeded: number;
  failed: number;
  results: PrioritizedLeadItem[];
  failedLeadIds: string[];
};

export type LeadScoringHistoryItem = {
  id: string;
  leadId: string;
  leadName: string;
  leadSource: string;
  score: number;
  label: string;
  explanation: unknown;
  modelVersion: string;
  createdAt: string;
};

export type LeadScoringHistoryResponse = {
  items: LeadScoringHistoryItem[];
  total: number;
};

export const leadsKeys = {
  all: ["leads"] as const,
  lists: () => [...leadsKeys.all, "list"] as const,
  ai: () => [...leadsKeys.all, "ai"] as const,
  scoringHistory: (limit = 50) =>
    [...leadsKeys.ai(), "history", limit] as const,
};

export function useLeadsList() {
  return useQuery({
    queryKey: leadsKeys.lists(),
    queryFn: async () => {
      const response = await fetch("/api/leads/list", {
        method: "GET",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "No se pudieron cargar los leads");
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("La respuesta del servidor no es JSON");
      }

      return response.json() as Promise<{ leads: LeadItem[] }>;
    },
  });
}

export function useImportLeadsFromSheets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ImportLeadsPayload) => {
      const response = await fetch("/api/leads/import-sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "No se pudieron importar los leads");
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("La respuesta del servidor no es JSON");
      }

      return response.json() as Promise<ImportLeadsResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
    },
  });
}

export function usePrioritizeLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: PrioritizeLeadsPayload = {},
    ): Promise<PrioritizeLeadsResponse> => {
      const response = await fetch("/api/ai/prioritize-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "No se pudieron priorizar los leads");
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("La respuesta del servidor no es JSON");
      }

      return response.json() as Promise<PrioritizeLeadsResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.ai() });
    },
  });
}

export function useLeadScoringHistory(limit = 50) {
  return useQuery({
    queryKey: leadsKeys.scoringHistory(limit),
    queryFn: async () => {
      const response = await fetch(
        `/api/ai/prioritize-leads?limit=${encodeURIComponent(limit)}`,
        {
          method: "GET",
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "No se pudo obtener el historial de scoring",
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("La respuesta del servidor no es JSON");
      }

      return response.json() as Promise<LeadScoringHistoryResponse>;
    },
  });
}

export function useAssignPropertyToLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AssignPropertyPayload) => {
      const response = await fetch("/api/leads/assign-property", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "No se pudo asignar la propiedad al lead",
        );
      }

      return response.json() as Promise<LeadItem>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
    },
  });
}
