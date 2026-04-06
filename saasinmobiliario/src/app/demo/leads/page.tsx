"use client";

import { useDemo } from "@/src/lib/demo/DemoContext";
import { Bot, Sparkles, AlertCircle } from "lucide-react";

function formatBudget(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DemoLeads() {
  const { leads, scoreLead, isScoring } = useDemo();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2b88a1] flex items-center gap-2">
            Gestión Inteligente de Leads
          </h1>
          <p className="text-gray-600 mt-1">
            Mira cómo el Scoring prioriza tus prospectos al instante en esta versión interactiva.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="overflow-x-auto p-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-6 py-4 font-semibold text-gray-600">Prospecto</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Prioridad IA</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Presupuesto</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Zona Preferida</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Fuente</th>
                <th className="px-6 py-4 font-semibold text-right text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2b88a1] to-[#1e5f73] flex items-center justify-center text-white font-bold text-xs shadow-inner">
                        {lead.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lead.name}</p>
                        <p className="text-xs text-gray-500">{lead.email || lead.phone || "Sin contacto"}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    {lead.latest_score ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                          lead.latest_score.label === "Alta"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : lead.latest_score.label === "Baja"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        <Bot className="w-3 h-3" />
                         Score: {lead.latest_score.score} - {lead.latest_score.label}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        <AlertCircle className="w-3 h-3" />
                        Aún sin analizar
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-gray-700 font-medium">{formatBudget(lead.budget)}</td>
                  <td className="px-6 py-4 text-gray-600">{lead.zone}</td>
                  <td className="px-6 py-4">
                     <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium shadow-sm border border-slate-200/60">
                       {lead.source}
                     </span>
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    {!lead.latest_score ? (
                       <button
                         onClick={() => scoreLead(lead.id)}
                         disabled={isScoring}
                         className="relative inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-[#2b88a1] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-teal-400 hover:to-teal-600 shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:grayscale group"
                       >
                         {isScoring ? (
                           <>
                             <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                             Analizando...
                           </>
                         ) : (
                           <>
                             <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                             Evaluar con IA
                           </>
                         )}
                       </button>
                    ) : (
                      <button className="text-[#2b88a1] font-medium text-sm hover:underline" onClick={() => alert("En la app real aquí verás el detalle analítico completo generado por la IA.")}>
                        Ver análisis completo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
