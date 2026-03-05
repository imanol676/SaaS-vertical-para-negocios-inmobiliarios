"use client";

import { useLeadScoringHistory } from "@/src/lib/hooks/useLeads";

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

export default function HistorialScoringPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useLeadScoringHistory(100);

  const items = data?.items ?? [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2b88a1]">
            Historial de Scoring
          </h1>
          <p className="mt-2 text-gray-700">
            Revisa los scorings generados por IA para tus leads más recientes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-md border border-[#2b88a1] px-4 py-2 text-sm font-semibold text-[#2b88a1] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isFetching ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          Cargando historial...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
          {error instanceof Error
            ? error.message
            : "No se pudo cargar el historial de scoring"}
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Registros</h2>
            <span className="text-sm text-gray-500">
              {items.length} resultados
            </span>
          </div>

          {items.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">
              Aún no hay scorings registrados.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Fecha
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Lead
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Fuente
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Score
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Etiqueta
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Resumen
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Modelo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                        {new Date(item.createdAt).toLocaleString("es-MX")}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {item.leadName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.leadSource}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{item.score}</td>
                      <td className="px-4 py-3 text-gray-700">
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${labelStyleMap[item.label] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}
                        >
                          {item.label}
                        </span>
                      </td>
                      <td className="max-w-sm px-4 py-3 text-gray-700">
                        {getExplanationSummary(item.explanation)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.modelVersion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
