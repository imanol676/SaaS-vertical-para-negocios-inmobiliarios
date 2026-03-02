"use client";

import { useLeadsList } from "@/src/lib/hooks/useLeads";

export default function LeadsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useLeadsList();
  const leads = data?.leads ?? [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2b88a1]">Leads</h1>
          <p className="mt-2 text-gray-700">
            Aquí podrás gestionar y visualizar todos tus leads importados.
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
                      Estado
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Fuente
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
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
                          ? `$${lead.budget.toLocaleString("es-MX")}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {lead.zone ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {lead.timeframe ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{lead.status}</td>
                      <td className="px-4 py-3 text-gray-700">{lead.source}</td>
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
