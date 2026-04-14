"use client";

import { useDemo } from "@/src/lib/demo/DemoContext";
import { Bot, Sparkles } from "lucide-react";

function formatBudget(value: number | null) {
  if (value == null) return "-";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const labelStyleMap: Record<string, string> = {
  Alta: "bg-green-100 text-green-700 border-green-200",
  Media: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Baja: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function DemoLeads() {
  const { leads, properties, scoreLead, isScoring } = useDemo();

  const handlePrioritizeAll = () => {
    // Score all leads that haven't been scored yet (Fake logic for top button)
    leads.forEach((l) => {
      if (!l.latest_score) {
        scoreLead(l.id);
      }
    });
  };

  return (
    <div className="space-y-6 p-1 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2b88a1]">Leads</h1>
          <p className="mt-2 text-gray-700 text-sm md:text-base">
            Aquí podrás gestionar y visualizar todos tus leads importados. (Modo Demo)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrioritizeAll}
            disabled={isScoring || leads.length === 0}
            className="rounded-md bg-[#2b88a1] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
          >
            {isScoring ? "Priorizando..." : <><Sparkles className="w-4 h-4" /> Priorizar con IA</>}
          </button>

          <button
            type="button"
            className="rounded-md border border-[#2b88a1] px-4 py-2 text-sm font-semibold text-[#2b88a1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Actualizar
          </button>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4 md:p-6 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Listado</h2>
          <span className="text-sm text-gray-500">{leads.length} leads</span>
        </div>

        {leads.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">
            Aún no hay leads. Importa desde Fuentes de Leads.
          </p>
        ) : (
          <div className="-mx-4 -mb-4 mt-4 overflow-x-auto sm:mx-0 sm:mb-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Nombre</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Teléfono</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Presupuesto</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Zona</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Timeframe</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Tipo de propiedad</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Estado</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Fuente</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Propiedad asignada</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Score IA</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Etiqueta IA</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Resumen IA</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Evaluar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => {
                    const scoring = lead.latest_score;

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-gray-800 font-medium">
                          {lead.name}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {lead.email ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {lead.phone ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">
                          {formatBudget(lead.budget)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {lead.zone ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {"-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {"-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {lead.status}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                             {lead.source}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={lead.property_id ?? ""}
                            disabled={true}
                            onChange={() => {}}
                            className="w-full min-w-32 rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 disabled:opacity-50"
                          >
                            <option value="">Sin asignar</option>
                            {(properties ?? []).map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-bold max-w-16">
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
                        <td className="min-w-64 max-w-sm px-4 py-3 text-gray-600 text-xs leading-relaxed italic">
                          {scoring
                            ? scoring.summary
                            : "-"}
                        </td>
                        <td className="px-4 py-3 min-w-32">
                           <button
                             onClick={() => scoreLead(lead.id)}
                             disabled={isScoring || !!scoring}
                             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                               scoring 
                                 ? 'text-gray-400 bg-gray-50 border border-gray-100'
                                 : 'bg-[#2b88a1]/10 text-[#2b88a1] border border-[#2b88a1]/30 hover:bg-[#2b88a1]/20 shadow-sm'
                             }`}
                           >
                             <Bot className="w-3.5 h-3.5" />
                             {scoring ? "Evaluado" : "Evaluar IA"}
                           </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
