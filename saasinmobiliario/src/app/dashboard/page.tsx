"use client";

import { useMemo } from "react";
import { useLeadsList } from "@/src/lib/hooks/useLeads";
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

function getLeadPriority(status: string) {
  const normalized = (status || "").toLowerCase();

  if (
    normalized.includes("alta") ||
    normalized.includes("high") ||
    normalized.includes("hot") ||
    normalized.includes("prioridad")
  ) {
    return "Alta";
  }

  if (
    normalized.includes("baja") ||
    normalized.includes("low") ||
    normalized.includes("cold")
  ) {
    return "Baja";
  }

  return "Media";
}

export default function Dashboard() {
  const { data, isLoading, isError, error } = useLeadsList();

  const metrics = useMemo(() => {
    const leads = data?.leads ?? [];
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

    const highPriorityLeads = leads.filter((lead) => {
      const status = (lead.status || "").toLowerCase();
      return (
        status.includes("alta") ||
        status.includes("high") ||
        status.includes("hot") ||
        status.includes("prioridad")
      );
    }).length;

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
  }, [data?.leads]);

  const leadsTrend14Days = useMemo(() => {
    const leads = data?.leads ?? [];
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
  }, [data?.leads]);

  const priorityDistribution = useMemo(() => {
    const leads = data?.leads ?? [];

    const counts = leads.reduce(
      (accumulator, lead) => {
        const priority = getLeadPriority(lead.status);
        accumulator[priority] += 1;
        return accumulator;
      },
      { Baja: 0, Media: 0, Alta: 0 },
    );

    return [
      { priority: "Baja", total: counts.Baja },
      { priority: "Media", total: counts.Media },
      { priority: "Alta", total: counts.Alta },
    ];
  }, [data?.leads]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#2b88a1]">Home</h1>
      <p className="mt-2 text-gray-600">
        Vista general de los leads de tu organización
      </p>

      {isLoading && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Cargando métricas...
        </div>
      )}

      {isError && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          No se pudieron cargar las métricas: {error.message}
        </div>
      )}

      {!isLoading && !isError && (
        <>
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

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <article className="rounded-xl border border-gray-200 bg-white p-6">
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
          </div>
        </>
      )}

      <div className="mt-6"></div>
    </div>
  );
}
