"use client";

import { useOrganization } from "@clerk/nextjs";
import { useOrganizationByClerkId } from "@/src/lib/hooks/useOrganizations";
import Link from "next/link";
import { AlertTriangle, Rocket } from "lucide-react";
import { usePathname } from "next/navigation";

export function TrialExpiredModal() {
  const { organization: clerkOrg, isLoaded: isClerkLoaded } = useOrganization();
  const { data: org, isLoading: isOrgLoading } = useOrganizationByClerkId(clerkOrg?.id ?? null);
  const pathname = usePathname();

  // Si no ha cargado Clerk o la info del org, no mostramos nada aún
  if (!isClerkLoaded || isOrgLoading) return null;

  // Si no hay organización o no estamos en dashboard, no aplica
  if (!org || !pathname?.startsWith("/dashboard")) return null;

  // Si el usuario está en la página de billing resolviendo el pago, no lo bloqueamos
  if (pathname === "/dashboard/billing") return null;

  const isTrial = org.plan_status === "trial";
  const trialEndsAt = org.trial_ends_at ? new Date(org.trial_ends_at) : null;
  const hasExpired = trialEndsAt ? trialEndsAt.getTime() < new Date().getTime() : false;

  if (!isTrial || !hasExpired) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Tu prueba gratuita ha finalizado
          </h2>
          
          <p className="text-slate-600 mb-6">
            Esperamos que hayas disfrutado probar EstateOS. Para continuar utilizando la plataforma y gestionando tus propiedades, por favor elige un plan.
          </p>

          <Link
            href="/dashboard/billing"
            className="flex items-center justify-center w-full py-3 px-4 bg-linear-to-r from-[#2b88a1] to-[#1e5f73] hover:from-[#216477] hover:to-[#164a5a] text-white rounded-xl font-semibold shadow-md transition-all group"
          >
            Ver planes disponibles
            <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
