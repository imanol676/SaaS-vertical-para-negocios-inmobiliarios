"use client";

import { useLeadScoringHistory, useLeadsList } from "@/src/lib/hooks/useLeads";

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

const getExplanationDetails = (
  explanation: unknown,
): { factor: string; detail: string }[] => {
  if (!explanation || typeof explanation !== "object") return [];
  const factors = (explanation as { factors?: unknown }).factors;
  if (!Array.isArray(factors)) return [];
  return factors
    .filter(
      (f): f is { factor: string; detail: string } =>
        !!f && typeof f === "object" && "factor" in f && "detail" in f,
    )
    .slice(0, 5);
};

export default function AgentLeadsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useLeadsList();
  const {
    data: scoringHistory,
    isFetching: isFetchingScoringHistory,
    refetch: refetchScoringHistory,
  } = useLeadScoringHistory(100);

  const leads = data?.leads ?? [];
  const latestScoringByLeadId = new Map(
    (scoringHistory?.items ?? []).map((item) => [item.leadId, item]),
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2b88a1]">Leads</h1>
          <p className="mt-2 text-gray-700">
            Visualiza los leads y su información de scoring generada por IA.
          </p>
        </div>
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

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          Cargando leads...
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
          {error instanceof Error
            ? error.message
            : "No se pudieron cargar los leads"}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="flex gap-3 text-sm text-gray-500">
            <span>{leads.length} leads en total</span>
          </div>

          {leads.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
              Aún no hay leads disponibles.
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => {
                const scoring = latestScoringByLeadId.get(lead.id);
                const factors = scoring
                  ? getExplanationDetails(scoring.explanation)
                  : [];

                return (
                  <div
                    key={lead.id}
                    className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Info principal del lead */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-semibold text-gray-900">
                            {lead.name}
                          </h3>
                          {scoring && (
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                labelStyleMap[scoring.label] ??
                                "border-slate-200 bg-slate-100 text-slate-700"
                              }`}
                            >
                              {scoring.label}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
                          {lead.email && <span>📧 {lead.email}</span>}
                          {lead.phone && <span>📞 {lead.phone}</span>}
                          {lead.zone && <span>📍 {lead.zone}</span>}
                          {lead.budget != null && (
                            <span>
                              💰{" "}
                              {new Intl.NumberFormat("es-AR", {
                                style: "currency",
                                currency: "ARS",
                                maximumFractionDigits: 0,
                              }).format(Number(lead.budget))}
                            </span>
                          )}
                          {lead.timeframe && <span>⏱ {lead.timeframe}</span>}
                          {lead.property_type && (
                            <span>🏠 {lead.property_type}</span>
                          )}
                        </div>

                        <div className="mt-2 flex gap-3 text-xs text-gray-400">
                          <span>Fuente: {lead.source}</span>
                          <span>Estado: {lead.status}</span>
                          {lead.property && (
                            <span>
                              Propiedad: {lead.property.title} —{" "}
                              {lead.property.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      {scoring && (
                        <div className="flex flex-col items-center rounded-lg bg-gray-50 px-4 py-2">
                          <span className="text-xs font-medium text-gray-500">
                            Score
                          </span>
                          <span className="text-2xl font-bold text-[#2b88a1]">
                            {scoring.score}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Explicación del scoring */}
                    {scoring && (
                      <div className="mt-4 rounded-md border border-gray-100 bg-gray-50 p-4">
                        <h4 className="text-sm font-semibold text-gray-700">
                          Explicación del Scoring
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          {getExplanationSummary(scoring.explanation)}
                        </p>
                        {factors.length > 0 && (
                          <ul className="mt-3 space-y-1">
                            {factors.map((f, i) => (
                              <li key={i} className="text-sm text-gray-600">
                                <span className="font-medium text-gray-700">
                                  {f.factor}:
                                </span>{" "}
                                {f.detail}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
