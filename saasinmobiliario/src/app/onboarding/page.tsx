"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrganization, useUser } from "@clerk/nextjs";
import { Building2, Sparkles, TrendingUp, Rocket, Check } from "lucide-react";
import { useCreateOrganization } from "@/src/lib/hooks/useOrganizations";
import { PLANS, type PlanId } from "@/src/lib/billing/plans";

const planUI: Record<
  PlanId,
  {
    icon: typeof Sparkles;
    color: string;
    border: string;
    hover: string;
  }
> = {
  starter: {
    icon: Sparkles,
    color: "from-slate-300",
    border: "border-slate-400",
    hover: "hover:border-slate-400",
  },
  pro: {
    icon: TrendingUp,
    color: "from-[#2b88a1]",
    border: "border-[#2b88a1]",
    hover: "hover:border-[#1e5f73]",
  },
  enterprise: {
    icon: Rocket,
    color: "from-amber-500",
    border: "border-amber-400",
    hover: "hover:border-amber-500",
  },
};

const planEntries = (Object.keys(PLANS) as PlanId[]).map((key) => ({
  ...PLANS[key],
  ...planUI[key],
}));

export default function Onboarding() {
  const { user, isLoaded } = useUser();
  const { organization } = useOrganization();
  const createOrganization = useCreateOrganization();
  const router = useRouter();
  const [formData, setFormData] = useState({
    plan: "pro",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkingInvitation, setCheckingInvitation] = useState(true);

  // Verificar si el usuario viene de una invitación (es agente)
  useEffect(() => {
    // Mientras Clerk no haya cargado, mantener el spinner
    if (!isLoaded) return;

    // Si no hay usuario u organización, es un admin nuevo → mostrar formulario
    if (!user || !organization) {
      setCheckingInvitation(false);
      return;
    }

    const checkInvitation = async () => {
      // Si ya tiene rol de agente en metadata, redirigir directo
      const role = (user.publicMetadata as { role?: string })?.role;
      if (role === "agent" || role === "member") {
        router.replace("/agent");
        return;
      }

      // Si ya tiene rol de owner/admin, no es un invitado
      if (role === "owner" || role === "admin") {
        setCheckingInvitation(false);
        return;
      }

      // Sin rol definido + tiene org → podría ser un agente invitado, verificar
      try {
        const res = await fetch("/api/auth/accept-invitation", {
          method: "POST",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.role === "agent") {
            await user.reload();
            router.replace("/agent");
            return;
          }
        }
      } catch {
        // Si falla, continuamos con el onboarding normal
      }

      setCheckingInvitation(false);
    };

    checkInvitation();
  }, [isLoaded, user, organization, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user?.id) {
      setErrorMessage(
        "No se pudo obtener la información del usuario. Por favor, recarga la página.",
      );
      return;
    }

    if (!organization?.id) {
      setErrorMessage(
        "Primero crea o selecciona una organización en Clerk, luego vuelve a este onboarding.",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await createOrganization.mutateAsync({
        plan: formData.plan,
      });

      await user.reload();

      // Redirigir al dashboard después de crear la organización
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error al crear la organización:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error al crear la organización. Intenta nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar loading mientras Clerk carga el usuario o se verifica la invitación
  if (!isLoaded || checkingInvitation) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2b88a1] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar error (no debería pasar con Clerk)
  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            No se pudo cargar la información del usuario
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#2b88a1] text-white rounded-lg hover:bg-[#1e5f73]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-12 h-12 text-[#2b88a1]" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Bienvenido a <span className="text-[#2b88a1]">EstateOS</span>
          </h1>
          <p className="text-lg text-slate-600">
            Configura tu organización para comenzar a gestionar tu inmobiliaria
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <p className="text-sm text-slate-600">
              Organización detectada en Clerk
            </p>
            <p className="text-lg font-semibold text-slate-900 mt-1">
              {organization?.name || "Sin organización activa"}
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Plan Selection */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Selecciona tu Plan
            </h2>
            <div className="flex items-start mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
              <Sparkles className="w-5 h-5 mr-3 mt-0.5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-sm">Prueba gratuita de 14 días incluida</p>
                <p className="text-sm mt-1 opacity-90">Selecciona el plan que mejor se adapte a tu inmobiliaria para comenzar. No se realizarán cobros y podrás cancelar o cambiar de plan en cualquier momento.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {planEntries.map((plan) => {
                const Icon = plan.icon;
                const isSelected = formData.plan === plan.id;

                return (
                  <label
                    key={plan.id}
                    className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ${
                      isSelected
                        ? `${plan.border} bg-linear-to-br ${plan.color} bg-opacity-5 shadow-md`
                        : `border-slate-200 ${plan.hover} hover:shadow-md`
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-[#2b88a1] to-[#1e5f73] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        MÁS POPULAR
                      </div>
                    )}

                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={isSelected}
                      onChange={(e) =>
                        setFormData({ ...formData, plan: e.target.value })
                      }
                      className="sr-only"
                    />

                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`mb-4 p-3 rounded-full bg-linear-to-br ${plan.color}`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {plan.description}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mb-1">
                        {plan.priceLabel}
                      </p>
                      <p className="text-xs text-slate-500 mb-4">
                        ARS/mes + IVA
                      </p>

                      <ul className="space-y-2 w-full text-left">
                        {plan.featuresList.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start text-sm text-slate-700"
                          >
                            <Check className="w-4 h-4 text-[#2b88a1] mr-2 mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div
                          className={`w-6 h-6 rounded-full bg-linear-to-br ${plan.color} flex items-center justify-center`}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || createOrganization.isPending}
              className="group relative px-8 py-4 bg-linear-to-r from-[#2b88a1] to-[#1e5f73] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="flex items-center gap-2">
                {isSubmitting || createOrganization.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando organización...
                  </>
                ) : (
                  <>
                    Iniciar prueba de 14 días
                    <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-8">
          Al continuar, aceptas nuestros términos de servicio y política de
          privacidad
        </p>
      </div>
    </div>
  );
}
