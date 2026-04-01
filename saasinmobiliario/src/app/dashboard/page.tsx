"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLeadsList, useLeadsMetrics, usePrioritizeLeads } from "@/src/lib/hooks/useLeads";
import { usePropertiesList } from "@/src/lib/hooks/useProperties";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

function getScoreLabel(lead: {
  latest_score: { score: number; label: string } | null;
  status: string;
}) {
  if (lead.latest_score) {
    const label = lead.latest_score.label.toLowerCase();
    if (label === "hot" || label === "alta" || label === "high") return "Alta";
    if (label === "cold" || label === "baja" || label === "low") return "Baja";
    return "Media";
  }
  const s = (lead.status || "").toLowerCase();
  if (s.includes("alta") || s.includes("high") || s.includes("hot"))
    return "Alta";
  if (s.includes("baja") || s.includes("low") || s.includes("cold"))
    return "Baja";
  return "Media";
}

function getScoreValue(lead: {
  latest_score: { score: number; label: string } | null;
}) {
  return lead.latest_score?.score ?? 0;
}

export default function Dashboard() {
  const { data: leadsData, isLoading: leadsLoading, isError: leadsError, error: leadsErrorObj } = useLeadsList();
  const { data: metricsData, isLoading: metricsLoading, isError: metricsIsError, error: metricsErrorObj } = useLeadsMetrics();
  const { data: properties, isLoading: propsLoading } = usePropertiesList();
  const prioritize = usePrioritizeLeads();

  const leads = useMemo(() => leadsData?.leads ?? [], [leadsData?.leads]);

  const top5Leads = useMemo(() => {
    return [...leads]
      .sort((a, b) => getScoreValue(b) - getScoreValue(a))
      .slice(0, 5);
  }, [leads]);

  const anyLoading = leadsLoading || propsLoading || metricsLoading;
  const isError = leadsError || metricsIsError;
  const error = leadsErrorObj || metricsErrorObj;

  const handlePrioritize = () => {
    // LLama a priorizar los leads sin score (max 10 por tanda para evitar cuellos)
    prioritize.mutate({ maxLeads: 10 });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#2b88a1]">Home</h1>
      <p className="mt-2 text-gray-600">
        Vista general de los leads de tu organización
      </p>

      {anyLoading && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Cargando métricas...
        </div>
      )}

      {isError && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          No se pudieron cargar las métricas: {error?.message}
        </div>
      )}

      {!anyLoading && !isError && metricsData && (
        <>
          {/* KPI Cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <article className="flex min-h-36 items-center justify-between rounded-xl border border-gray-200 bg-white p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Leads</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {metricsData.metrics.totalLeads}
                </h2>
              </div>
              <p className="text-sm font-medium text-[#2b88a1]">
                {formatPercent(metricsData.metrics.growthVsPreviousPeriod)} vs período
                anterior
              </p>
            </article>

            <article className="flex min-h-36 items-center justify-between rounded-xl border border-gray-200 bg-white p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Nuevos Leads (últimos 7 días)
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {metricsData.metrics.newLeadsLast7Days}
                </h2>
              </div>
              <p className="text-sm text-gray-600">Mide flujo de entrada</p>
            </article>

            <article className="flex min-h-36 items-center justify-between rounded-xl border border-gray-200 bg-white p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Leads Alta Prioridad
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {metricsData.metrics.highPriorityLeads}
                </h2>
              </div>
              <p className="text-sm font-medium text-gray-700">
                {metricsData.metrics.highPriorityLeads} (
                {Math.round(metricsData.metrics.highPriorityPercent)}%)
              </p>
            </article>

            <article className="flex min-h-36 items-center justify-between rounded-xl border border-gray-200 bg-white p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  % Leads con Match Alto con Inventario
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {Math.round(metricsData.metrics.highMatchPercent)}%
                </h2>
              </div>
              <p className="max-w-52 text-right text-sm text-gray-700">
                {metricsData.metrics.highMatchLeads} leads con match fuerte contra
                propiedades activas
              </p>
            </article>
          </div>

          {/* Charts + Alerts row */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <article className="rounded-xl border border-gray-200 bg-white p-6 xl:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700">
                Tendencia de Leads (últimos 14 días)
              </h3>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsData.leadsTrend14Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="leads"
                      stroke="#2b88a1"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            {/* Alertas Inteligentes */}
            <article className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-700">
                Alertas Inteligentes
              </h3>

              {metricsData.alerts.leadsWithoutProperty > 0 && (
                <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
                  <span className="mt-0.5 text-amber-500">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      {metricsData.alerts.leadsWithoutProperty} lead
                      {metricsData.alerts.leadsWithoutProperty !== 1 && "s"} sin propiedad
                      asociada
                    </p>
                    <p className="text-xs text-amber-600">
                      Asocia una propiedad para mejorar el match
                    </p>
                  </div>
                </div>
              )}

              {metricsData.alerts.leadsWithoutScore > 0 && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
                  <span className="mt-0.5 text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      {metricsData.alerts.leadsWithoutScore} lead
                      {metricsData.alerts.leadsWithoutScore !== 1 && "s"} sin score
                    </p>
                    <p className="text-xs text-red-600 mb-2">
                      Ejecuta el scoring de IA para priorizarlos
                    </p>
                    <button
                      onClick={handlePrioritize}
                      disabled={prioritize.isPending}
                      className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {prioritize.isPending ? "Calificando..." : "Calificar ahora"}
                    </button>
                  </div>
                </div>
              )}

              {metricsData.alerts.activePropsWithoutLeads > 0 && (
                <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                  <span className="mt-0.5 text-blue-500">
                    <Info className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      {metricsData.alerts.activePropsWithoutLeads} propiedad
                      {metricsData.alerts.activePropsWithoutLeads !== 1 && "es"} activa
                      {metricsData.alerts.activePropsWithoutLeads !== 1 && "s"} sin leads
                    </p>
                    <p className="text-xs text-blue-600">
                      Propiedades activas que aún no tienen leads asociados
                    </p>
                  </div>
                </div>
              )}

              {metricsData.alerts.leadsWithoutProperty === 0 &&
                metricsData.alerts.leadsWithoutScore === 0 &&
                metricsData.alerts.activePropsWithoutLeads === 0 && (
                  <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3">
                    <span className="mt-0.5 text-green-500">
                      <CheckCircle className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-medium text-green-800">
                      Todo en orden, sin alertas pendientes
                    </p>
                  </div>
                )}
            </article>
          </div>

          {/* Priority distribution + Top 5 Leads */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <article className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-700">
                Distribución de prioridad (Baja, Media, Alta)
              </h3>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsData.priorityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#1e5f73" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            {/* Top 5 Leads Más Prioritarios */}
            <article className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-700">
                Top 5 Leads Más Prioritarios Hoy
              </h3>

              {top5Leads.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  No hay leads registrados todavía.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                        <th className="pb-2 pr-3">Nombre</th>
                        <th className="pb-2 pr-3">Score</th>
                        <th className="pb-2 pr-3">Zona</th>
                        <th className="pb-2 pr-3">Presupuesto</th>
                        <th className="pb-2 pr-3">Fuente</th>
                        <th className="pb-2">Ver</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top5Leads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="py-2.5 pr-3 font-medium text-gray-900">
                            {lead.name}
                          </td>
                          <td className="py-2.5 pr-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                getScoreLabel(lead) === "Alta"
                                  ? "bg-green-100 text-green-800"
                                  : getScoreLabel(lead) === "Baja"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {lead.latest_score
                                ? `${lead.latest_score.score} — ${lead.latest_score.label}`
                                : "Sin score"}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 text-gray-600">
                            {lead.zone || "—"}
                          </td>
                          <td className="py-2.5 pr-3 text-gray-600">
                            {formatBudget(lead.budget)}
                          </td>
                          <td className="py-2.5 pr-3 text-gray-600">
                            {lead.source}
                          </td>
                          <td className="py-2.5">
                            <Link
                              href="/dashboard/leads"
                              className="text-[#2b88a1] hover:underline"
                            >
                              Ver
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          </div>
        </>
      )}
    </div>
  );
}
