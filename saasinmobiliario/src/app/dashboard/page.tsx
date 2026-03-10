"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLeadsList } from "@/src/lib/hooks/useLeads";
import { usePropertiesList } from "@/src/lib/hooks/useProperties";
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
  const { data, isLoading, isError, error } = useLeadsList();
  const { data: properties, isLoading: propsLoading } = usePropertiesList();

  const leads = data?.leads ?? [];

  const metrics = useMemo(() => {
    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);

    const currentWindowStart = new Date(now);
    currentWindowStart.setDate(currentWindowStart.getDate() - 30);

    const previousWindowStart = new Date(now);
    previousWindowStart.setDate(previousWindowStart.getDate() - 60);

    const totalLeads = leads.length;

    const newLeadsLast7Days = leads.filter(
      (lead) => new Date(lead.created_at) >= last7Days,
    ).length;

    const currentPeriodCount = leads.filter((lead) => {
      const createdAt = new Date(lead.created_at);
      return createdAt >= currentWindowStart && createdAt <= now;
    }).length;

    const previousPeriodCount = leads.filter((lead) => {
      const createdAt = new Date(lead.created_at);
      return createdAt >= previousWindowStart && createdAt < currentWindowStart;
    }).length;

    const growthVsPreviousPeriod =
      previousPeriodCount === 0
        ? currentPeriodCount > 0
          ? 100
          : 0
        : ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) *
          100;

    const highPriorityLeads = leads.filter(
      (lead) => getScoreLabel(lead) === "Alta",
    ).length;

    const highPriorityPercent =
      totalLeads > 0 ? (highPriorityLeads / totalLeads) * 100 : 0;

    const highMatchLeads = leads.filter((lead) =>
      Boolean(lead.property_id),
    ).length;

    const highMatchPercent =
      totalLeads > 0 ? (highMatchLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      growthVsPreviousPeriod,
      newLeadsLast7Days,
      highPriorityLeads,
      highPriorityPercent,
      highMatchLeads,
      highMatchPercent,
    };
  }, [leads]);

  const leadsTrend14Days = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
    });

    const days = Array.from({ length: 14 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (13 - index));

      return {
        key: date.toISOString().slice(0, 10),
        label: formatter.format(date),
        leads: 0,
      };
    });

    const mapByDate = new Map(days.map((day) => [day.key, day]));

    leads.forEach((lead) => {
      const createdAt = new Date(lead.created_at);
      const key = createdAt.toISOString().slice(0, 10);
      const day = mapByDate.get(key);

      if (day) {
        day.leads += 1;
      }
    });

    return days;
  }, [leads]);

  const priorityDistribution = useMemo(() => {
    const counts = leads.reduce(
      (accumulator, lead) => {
        const priority = getScoreLabel(lead);
        accumulator[priority] += 1;
        return accumulator;
      },
      { Baja: 0, Media: 0, Alta: 0 } as Record<string, number>,
    );

    return [
      { priority: "Baja", total: counts.Baja ?? 0 },
      { priority: "Media", total: counts.Media ?? 0 },
      { priority: "Alta", total: counts.Alta ?? 0 },
    ];
  }, [leads]);

  const top5Leads = useMemo(() => {
    return [...leads]
      .sort((a, b) => getScoreValue(b) - getScoreValue(a))
      .slice(0, 5);
  }, [leads]);

  const alerts = useMemo(() => {
    const leadsWithoutProperty = leads.filter((l) => !l.property_id).length;
    const leadsWithoutScore = leads.filter((l) => !l.latest_score).length;

    const propertyList = properties ?? [];
    const leadPropertyIds = new Set(
      leads.map((l) => l.property_id).filter(Boolean),
    );
    const activePropsWithoutLeads = propertyList.filter((p) =>
      p.status.toLowerCase() === "active" || p.status.toLowerCase() === "activa"
        ? !leadPropertyIds.has(p.id)
        : false,
    ).length;

    return { leadsWithoutProperty, leadsWithoutScore, activePropsWithoutLeads };
  }, [leads, properties]);

  const anyLoading = isLoading || propsLoading;

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
          No se pudieron cargar las métricas: {error.message}
        </div>
      )}

      {!anyLoading && !isError && (
        <>
          {/* KPI Cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <article className="flex min-h-36 items-center justify-between rounded-xl border border-gray-200 bg-white p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Leads</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.totalLeads}
                </h2>
              </div>
              <p className="text-sm font-medium text-[#2b88a1]">
                {formatPercent(metrics.growthVsPreviousPeriod)} vs período
                anterior
              </p>
            </article>

            <article className="flex min-h-36 items-center justify-between rounded-xl border border-gray-200 bg-white p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Nuevos Leads (últimos 7 días)
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.newLeadsLast7Days}
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
                  {metrics.highPriorityLeads}
                </h2>
              </div>
              <p className="text-sm font-medium text-gray-700">
                {metrics.highPriorityLeads} (
                {Math.round(metrics.highPriorityPercent)}%)
              </p>
            </article>

            <article className="flex min-h-36 items-center justify-between rounded-xl border border-gray-200 bg-white p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  % Leads con Match Alto con Inventario
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {Math.round(metrics.highMatchPercent)}%
                </h2>
              </div>
              <p className="max-w-52 text-right text-sm text-gray-700">
                {metrics.highMatchLeads} leads con match fuerte contra
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
                  <LineChart data={leadsTrend14Days}>
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

              {alerts.leadsWithoutProperty > 0 && (
                <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
                  <span className="mt-0.5 text-lg leading-none text-amber-500">
                    ⚠
                  </span>
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      {alerts.leadsWithoutProperty} lead
                      {alerts.leadsWithoutProperty !== 1 && "s"} sin propiedad
                      asociada
                    </p>
                    <p className="text-xs text-amber-600">
                      Asocia una propiedad para mejorar el match
                    </p>
                  </div>
                </div>
              )}

              {alerts.leadsWithoutScore > 0 && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
                  <span className="mt-0.5 text-lg leading-none text-red-500">
                    ⚠
                  </span>
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      {alerts.leadsWithoutScore} lead
                      {alerts.leadsWithoutScore !== 1 && "s"} sin score
                    </p>
                    <p className="text-xs text-red-600">
                      Ejecuta el scoring de IA para priorizarlos
                    </p>
                  </div>
                </div>
              )}

              {alerts.activePropsWithoutLeads > 0 && (
                <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                  <span className="mt-0.5 text-lg leading-none text-blue-500">
                    ℹ
                  </span>
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      {alerts.activePropsWithoutLeads} propiedad
                      {alerts.activePropsWithoutLeads !== 1 && "es"} activa
                      {alerts.activePropsWithoutLeads !== 1 && "s"} sin leads
                    </p>
                    <p className="text-xs text-blue-600">
                      Propiedades activas que aún no tienen leads asociados
                    </p>
                  </div>
                </div>
              )}

              {alerts.leadsWithoutProperty === 0 &&
                alerts.leadsWithoutScore === 0 &&
                alerts.activePropsWithoutLeads === 0 && (
                  <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3">
                    <span className="mt-0.5 text-lg leading-none text-green-500">
                      ✓
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
                  <BarChart data={priorityDistribution}>
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
