import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export const leadsKeys = {
  all: ["leads"] as const,
  lists: () => [...leadsKeys.all, "list"] as const,
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
