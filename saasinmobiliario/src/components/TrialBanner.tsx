"use client";

import { useOrganization } from "@clerk/nextjs";
import { useOrganizationByClerkId } from "@/src/lib/hooks/useOrganizations";
import Link from "next/link";
import { AlertCircle, Clock } from "lucide-react";
import { usePathname } from "next/navigation";

export function TrialBanner() {
  const { organization: clerkOrg } = useOrganization();
  const { data: org, isLoading } = useOrganizationByClerkId(clerkOrg?.id ?? null);
  const pathname = usePathname();

  // No mostrar el banner si ya estamos en la página de facturación para no ser redundantes
  if (pathname === "/dashboard/billing") return null;

  if (isLoading || !org) return null;

  if (org.plan_status !== "trial" || !org.trial_ends_at) return null;

  const trialEnds = new Date(org.trial_ends_at);
  const today = new Date();
  const diffTime = trialEnds.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Si ya expiró, no mostramos el banner (se mostrará el modal bloqueante u otro aviso)
  if (diffDays < 0) return null;

  const isUrgent = diffDays <= 3;

  return (
    <div
      className={`px-4 py-2 text-sm font-medium text-center flex items-center justify-center gap-2 ${
        isUrgent ? "bg-red-50 text-red-700 border-b border-red-200" : "bg-blue-50 text-blue-700 border-b border-blue-200"
      }`}
    >
      {isUrgent ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
      <span>
        Te quedan <strong>{diffDays} {diffDays === 1 ? "día" : "días"}</strong> de prueba gratuita en el plan Pro.
      </span>
      <Link
        href="/dashboard/billing"
        className="ml-2 underline font-semibold hover:opacity-80"
      >
        Elegir un plan
      </Link>
    </div>
  );
}
