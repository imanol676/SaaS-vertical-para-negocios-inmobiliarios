"use client";

import { useState } from "react";
import {
  useLeadScoringHistory,
  useLeadsList,
  usePrioritizeLeads,
  useAssignPropertyToLead,
} from "@/src/lib/hooks/useLeads";
import { usePropertiesList } from "@/src/lib/hooks/useProperties";

const labelStyleMap: Record<string, string> = {
  hot: "bg-green-100 text-green-700 border-green-200",
  warm: "bg-yellow-100 text-yellow-700 border-yellow-200",
  cold: "bg-slate-100 text-slate-700 border-slate-200",
};

const getExplanationSummary = (explanation: unknown): string => {
  if (!explanation || typeof explanation !== "object") return "-";
  const summary = (explanation as { summary?: unknown }).summary;
  return typeof summary === "string" && summary.trim().length > 0
    ? summary
    : "-";
};

export default function LeadsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useLeadsList();
  const {
    data: scoringHistory,
    isFetching: isFetchingScoringHistory,
    refetch: refetchScoringHistory,
  } = useLeadScoringHistory(100);
  const prioritizeLeadsMutation = usePrioritizeLeads();
  const assignPropertyMutation = useAssignPropertyToLead();
  const { data: properties } = usePropertiesList();
  const [assigningLeadId, setAssigningLeadId] = useState<string | null>(null);

  const leads = data?.leads ?? [];
  const latestScoringByLeadId = new Map(
    (scoringHistory?.items ?? []).map((item) => [item.leadId, item]),
  );

  const handlePrioritizeLeads = async () => {
    if (leads.length === 0) return;

    await prioritizeLeadsMutation.mutateAsync({
      leadIds: leads.map((lead) => lead.id),
    });

    await refetchScoringHistory();
  };

  const handleAssignProperty = async (
    leadId: string,
    propertyId: string | null,
  ) => {
    setAssigningLeadId(leadId);
    try {
      await assignPropertyMutation.mutateAsync({ leadId, propertyId });
    } finally {
      setAssigningLeadId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2b88a1]">Leads</h1>
          <p className="mt-2 text-gray-700">
            Aquí podrás gestionar y visualizar todos tus leads importados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrioritizeLeads}
            disabled={prioritizeLeadsMutation.isPending || leads.length === 0}
            className="rounded-md bg-[#2b88a1] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {prioritizeLeadsMutation.isPending
              ? "Priorizando..."
              : "Priorizar con IA"}
          </button>

          <button
            type="button"
            onClick={() => {
              void refetch();
              void refetchScoringHistory();
            }}
            disabled={isFetching || isFetchingScoringHistory}
            className="rounded-md border border-[#2b88a1] px-4 py-2 text-sm font-semibold text-[#2b88a1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetching || isFetchingScoringHistory
              ? "Actualizando..."
              : "Actualizar"}
          </button>
        </div>
      </div>

      {prioritizeLeadsMutation.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {prioritizeLeadsMutation.error instanceof Error
            ? prioritizeLeadsMutation.error.message
            : "No se pudo ejecutar la priorización con IA"}
        </div>
      ) : null}

      {prioritizeLeadsMutation.isSuccess ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
          Priorización completada: {prioritizeLeadsMutation.data.succeeded} de{" "}
          {prioritizeLeadsMutation.data.processed} leads procesados.
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          Cargando leads...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
          {error instanceof Error
            ? error.message
            : "No se pudieron cargar los leads"}
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Listado</h2>
            <span className="text-sm text-gray-500">{leads.length} leads</span>
          </div>

          {leads.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">
              Aún no hay leads. Importa desde Fuentes de Leads.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Nombre
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Teléfono
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Presupuesto
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Zona
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Timeframe
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Tipo de propiedad
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Estado
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Fuente
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Propiedad asignada
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Score IA
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Etiqueta IA
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Resumen IA
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => {
                    const scoring = latestScoringByLeadId.get(lead.id);

                    return (
                      <tr key={lead.id}>
                        <td className="px-4 py-3 text-gray-800">{lead.name}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {lead.email ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {lead.phone ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {lead.budget != null
                            ? new Intl.NumberFormat("es-AR", {
                                style: "currency",
                                currency: "ARS",
                                maximumFractionDigits: 0,
                              }).format(lead.budget)
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {lead.zone ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {lead.timeframe ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {lead.property_type ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {lead.status}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {lead.source}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={lead.property_id ?? ""}
                            disabled={assigningLeadId === lead.id}
                            onChange={(e) => {
                              const value = e.target.value || null;
                              void handleAssignProperty(lead.id, value);
                            }}
                            className="w-full min-w-40 rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 disabled:opacity-50"
                          >
                            <option value="">Sin asignar</option>
                            {(properties ?? []).map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title} — {p.location}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {scoring ? scoring.score : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {scoring ? (
                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${labelStyleMap[scoring.label] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}
                            >
                              {scoring.label}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="max-w-xs px-4 py-3 text-gray-700">
                          {scoring
                            ? getExplanationSummary(scoring.explanation)
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
