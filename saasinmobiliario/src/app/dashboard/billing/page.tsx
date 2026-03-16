"use client";

import { useState } from "react";
import {
  Check,
  Crown,
  Sparkles,
  TrendingUp,
  Rocket,
  CreditCard,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import { useOrganization } from "@clerk/nextjs";
import { useOrganizationByClerkId } from "@/src/lib/hooks/useOrganizations";
import {
  useBillingStatus,
  useCreateSubscription,
  useCancelSubscription,
} from "@/src/lib/hooks/useBilling";
import { PLANS, type PlanId, formatLimit } from "@/src/lib/billing/plans";

const planUI: Record<
  PlanId,
  {
    icon: typeof Sparkles;
    gradient: string;
    border: string;
    badge: string;
  }
> = {
  starter: {
    icon: Sparkles,
    gradient: "from-slate-400 to-slate-600",
    border: "border-slate-300",
    badge: "bg-slate-100 text-slate-700",
  },
  pro: {
    icon: TrendingUp,
    gradient: "from-[#2b88a1] to-[#1e5f73]",
    border: "border-[#2b88a1]",
    badge: "bg-[#2b88a1]/10 text-[#2b88a1]",
  },
  enterprise: {
    icon: Rocket,
    gradient: "from-amber-400 to-amber-600",
    border: "border-amber-400",
    badge: "bg-amber-50 text-amber-700",
  },
};

const planEntries = (Object.keys(PLANS) as PlanId[]).map((key) => ({
  ...PLANS[key],
  ...planUI[key],
}));

// Tabla comparativa de límites
const limitRows = [
  { label: "Leads por mes", key: "maxLeads" as const },
  { label: "Propiedades", key: "maxProperties" as const },
  { label: "Usuarios", key: "maxUsers" as const },
  { label: "Scorings IA por mes", key: "maxAiScorings" as const },
  { label: "Importación Sheets", key: "sheetsImport" as const },
  { label: "Soporte prioritario", key: "prioritySupport" as const },
];

export default function BillingPage() {
  const { organization: clerkOrg } = useOrganization();
  const { data: org } = useOrganizationByClerkId(clerkOrg?.id ?? null);
  const { data: billingStatus } = useBillingStatus();
  const createSubscription = useCreateSubscription();
  const cancelSubscription = useCancelSubscription();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const currentPlan = org?.plan ?? "starter";
  const planStatus = org?.plan_status ?? "trial";
  const isSubscribed = billingStatus?.status === "authorized";
  const isTrial = planStatus === "trial";

  const handleSubscribe = (planId: PlanId) => {
    createSubscription.mutate(planId);
  };

  const handleCancel = () => {
    cancelSubscription.mutate(undefined, {
      onSuccess: () => setShowCancelConfirm(false),
    });
  };

  const statusLabel: Record<string, { text: string; className: string }> = {
    authorized: { text: "Activa", className: "bg-green-100 text-green-700" },
    pending: { text: "Pendiente", className: "bg-yellow-100 text-yellow-700" },
    paused: { text: "Pausada", className: "bg-orange-100 text-orange-700" },
    cancelled: {
      text: "Cancelada",
      className: "bg-red-100 text-red-700",
    },
    trial: { text: "Prueba gratuita", className: "bg-blue-100 text-blue-700" },
    none: { text: "Sin suscripción", className: "bg-gray-100 text-gray-700" },
  };

  const currentStatus =
    isTrial && billingStatus?.status !== "authorized"
      ? statusLabel.trial
      : (statusLabel[billingStatus?.status ?? "none"] ?? statusLabel.none);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Facturación y Plan
        </h1>
        <p className="text-slate-600 mt-1">
          Gestioná tu suscripción y los límites de tu plan
        </p>
      </div>

      {/* Current plan card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl bg-linear-to-br ${planUI[currentPlan as PlanId]?.gradient ?? "from-slate-400 to-slate-600"}`}
            >
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Plan actual</p>
              <p className="text-xl font-bold text-slate-900">
                {PLANS[currentPlan as PlanId]?.name ?? currentPlan}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.className}`}
            >
              {currentStatus.text}
            </span>

            {isSubscribed && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Cancelar suscripción
              </button>
            )}
          </div>
        </div>

        {isTrial && org?.trial_ends_at && (
          <div className="mt-4 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-700">
              Tu período de prueba termina el{" "}
              <strong>
                {new Date(org.trial_ends_at).toLocaleDateString("es-AR")}
              </strong>
              . Suscribite a un plan para no perder acceso.
            </p>
          </div>
        )}

        {billingStatus?.nextPaymentDate && isSubscribed && (
          <p className="mt-3 text-sm text-slate-500">
            Próximo cobro:{" "}
            {new Date(billingStatus.nextPaymentDate).toLocaleDateString(
              "es-AR",
            )}
          </p>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Cancelar suscripción
              </h3>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro? Al cancelar perderás acceso a las funcionalidades
              de tu plan actual al finalizar el período de facturación.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelSubscription.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cancelSubscription.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirmar cancelación"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {isSubscribed ? "Cambiar de plan" : "Elegí tu plan"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planEntries.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-6 transition-all ${
                  isCurrent
                    ? `${plan.border} shadow-lg`
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-[#2b88a1] to-[#1e5f73] text-white text-xs font-bold px-3 py-1 rounded-full">
                    MÁS POPULAR
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${plan.badge}`}
                    >
                      ACTUAL
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div
                    className={`mx-auto mb-4 p-3 w-fit rounded-xl bg-linear-to-br ${plan.gradient}`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {plan.description}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-4">
                    {plan.priceLabel}
                  </p>
                  <p className="text-xs text-slate-500">ARS/mes + IVA</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.featuresList.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start text-sm text-slate-700"
                    >
                      <Check className="w-4 h-4 text-[#2b88a1] mr-2 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent && isSubscribed ? (
                  <button
                    disabled
                    className="w-full py-2.5 text-sm font-medium text-slate-500 bg-slate-100 rounded-lg cursor-not-allowed"
                  >
                    Plan actual
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={createSubscription.isPending}
                    className={`w-full py-2.5 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-50 bg-linear-to-r ${plan.gradient} hover:opacity-90`}
                  >
                    {createSubscription.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : isCurrent ? (
                      "Activar plan"
                    ) : (
                      "Suscribirse"
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Limits comparison table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Comparativa de límites por plan
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-6 py-3 font-medium text-slate-600">
                  Funcionalidad
                </th>
                {planEntries.map((plan) => (
                  <th
                    key={plan.id}
                    className={`text-center px-6 py-3 font-medium ${
                      currentPlan === plan.id
                        ? "text-[#2b88a1]"
                        : "text-slate-600"
                    }`}
                  >
                    {plan.name}
                    {currentPlan === plan.id && (
                      <span className="ml-1 text-xs">(actual)</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {limitRows.map((row) => (
                <tr
                  key={row.key}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-6 py-3 text-slate-700 font-medium">
                    {row.label}
                  </td>
                  {planEntries.map((plan) => {
                    const value = plan.features[row.key];
                    const isBool = typeof value === "boolean";

                    return (
                      <td
                        key={plan.id}
                        className={`text-center px-6 py-3 ${
                          currentPlan === plan.id
                            ? "bg-[#2b88a1]/5 font-medium"
                            : ""
                        }`}
                      >
                        {isBool ? (
                          value ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-slate-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-slate-900">
                            {formatLimit(value as number)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment info */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <CreditCard className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Método de pago</h3>
        </div>
        <p className="text-sm text-slate-600">
          Los pagos se procesan de forma segura a través de{" "}
          <strong>Mercado Pago</strong>. Podés pagar con tarjeta de
          crédito/débito, transferencia bancaria o dinero en cuenta de MP. Al
          suscribirte serás redirigido al checkout de Mercado Pago.
        </p>
      </div>
    </div>
  );
}
