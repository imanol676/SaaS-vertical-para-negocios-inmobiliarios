"use client";

import Link from "next/link";
import { AlertTriangle, Info, CheckCircle, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDemo } from "@/src/lib/demo/DemoContext";

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatBudget(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// ---------------- Mocked Statistics ----------------
const MOCK_METRICS = {
  totalLeads: 124,
  growthVsPreviousPeriod: 34.2,
  newLeadsLast7Days: 18,
  highPriorityLeads: 42,
  highPriorityPercent: 33.8,
  highMatchPercent: 62,
  highMatchLeads: 77,
};

const MOCK_TREND = [
  { label: "Lun", leads: 4 },
  { label: "Mar", leads: 7 },
  { label: "Mie", leads: 5 },
  { label: "Jue", leads: 12 },
  { label: "Vie", leads: 8 },
  { label: "Sab", leads: 15 },
  { label: "Dom", leads: 9 },
];

const MOCK_PRIORITY = [
  { priority: "Baja", total: 31 },
  { priority: "Media", total: 51 },
  { priority: "Alta", total: 42 },
];
// --------------------------------------------------

export default function DemoDashboard() {
  const { leads, isScoring } = useDemo();

  // Top 5 leads de la demo
  const top5Leads = [...leads]
    .sort((a, b) => (b.latest_score?.score || 0) - (a.latest_score?.score || 0))
    .slice(0, 5);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-[#2b88a1]">Home</h1>
        <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
          Modo Interactivo Local
        </div>
      </div>
      <p className="mt-2 text-gray-600">
        Demo en tiempo real (datos ficticios generados para este tour).
      </p>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="flex min-h-36 items-center justify-between rounded-xl border border-gray-200 bg-white p-6 opacity-100 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Leads (Demo)</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {MOCK_METRICS.totalLeads}
            </h2>
          </div>
          <p className="text-sm font-medium text-green-600">
            {formatPercent(MOCK_METRICS.growthVsPreviousPeriod)} vs período
            anterior
          </p>
        </article>

        <article className="flex min-h-36 items-center justify-between rounded-xl border border-gray-200 bg-white p-6 opacity-100 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Nuevos Leads (últimos 7 días)
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {MOCK_METRICS.newLeadsLast7Days}
            </h2>
          </div>
          <p className="text-sm text-gray-600">Mide flujo de entrada</p>
        </article>

        <article className="flex min-h-36 items-center justify-between rounded-xl border border-gray-200 bg-white p-6 opacity-100 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Leads Alta Prioridad calculados con IA
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {MOCK_METRICS.highPriorityLeads}
            </h2>
          </div>
          <div className="text-right">
              <Sparkles className="w-4 h-4 text-amber-500 inline mr-1" />
              <span className="text-sm font-medium text-amber-600">
                ({Math.round(MOCK_METRICS.highPriorityPercent)}%) optimizado
              </span>
          </div>
        </article>

        <article className="flex min-h-36 items-center justify-between rounded-xl border border-gray-200 bg-white p-6 opacity-100 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Match Alto con Inventario
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {MOCK_METRICS.highMatchPercent}%
            </h2>
          </div>
          <p className="max-w-52 text-right text-sm text-gray-700">
            {MOCK_METRICS.highMatchLeads} leads listos para visitar tus propiedades
          </p>
        </article>
      </div>

      {/* Charts + Alerts row */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-gray-200 bg-white p-6 xl:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Tendencia de Leads en la última semana
          </h3>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#2b88a1"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Alertas Inteligentes Demo */}
        <article className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 overflow-hidden">
          <div className="flex justify-between items-center bg-gray-50 p-2 -mt-6 -mx-6 mb-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">
                Alertas Activas
              </h3>
              <span className="bg-[#2b88a1] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">IA</span>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 mt-4 border border-amber-100">
            <span className="mt-0.5 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-amber-800">
                2 leads sin propiedad asociada
              </p>
              <p className="text-xs text-amber-600">
                Podrían estar interesados en "Piso Recoleta"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 border border-red-100 relative group overflow-hidden">
            <span className="mt-0.5 text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                1 lead reciente sin score
              </p>
              <p className="text-xs text-red-600 mb-2">
                Identifica qué tan calificado está
              </p>
              <button
                disabled={true}
                className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-md opacity-50 cursor-not-allowed w-full text-center"
              >
                Acción en pestaña Leads
              </button>
            </div>
          </div>
        </article>
      </div>

      {/* Priority distribution + Top 5 Leads */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-gray-700">
            Distribución de Prioridad Simulada
          </h3>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_PRIORITY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="total" fill="#1e5f73" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Top 5 Leads */}
        <article className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-gray-700">
            Tus Prospectos en Modo Demo
          </h3>
          <p className="text-xs text-gray-500 mb-4 mt-1">Estos datos viven en tu navegador temporalmente.</p>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                  <th className="pb-2 pr-3">Nombre</th>
                  <th className="pb-2 pr-3">Prioridad IA</th>
                  <th className="pb-2 pr-3">Presupuesto</th>
                  <th className="pb-2">Fuente</th>
                </tr>
              </thead>
              <tbody>
                {top5Leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 group transition-colors"
                  >
                    <td className="py-3 pr-3 font-medium text-gray-900 group-hover:text-[#2b88a1]">
                      {lead.name}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          lead.latest_score?.label === "Alta"
                            ? "bg-green-100 text-green-800"
                            : lead.latest_score?.label === "Baja"
                              ? "bg-red-100 text-red-800"
                              : lead.latest_score?.label === "Media"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {lead.latest_score
                          ? `${lead.latest_score.score} — ${lead.latest_score.label}`
                          : "Pendiente"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-gray-600">
                      {formatBudget(lead.budget)}
                    </td>
                    <td className="py-3 text-gray-600">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs border border-gray-200 shadow-sm">{lead.source}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
             <Link href="/demo/leads" className="text-sm font-semibold text-[#2b88a1] hover:underline flex items-center gap-1">Ver todos <ArrowRightIcon /></Link>
          </div>
        </article>
      </div>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  );
}
