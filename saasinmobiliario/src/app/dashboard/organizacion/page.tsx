"use client";

import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import {
  useOrganizationByClerkId,
  useUpdateOrganization,
} from "@/src/lib/hooks/useOrganizations";

const planLabels: Record<string, string> = {
  starter: "Starter",
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise",
};

const planStatusLabels: Record<string, string> = {
  active: "Activo",
  inactive: "Inactivo",
  trial: "Prueba",
};

const planStatusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  trial: "bg-yellow-100 text-yellow-700 border-yellow-200",
  inactive: "bg-red-100 text-red-700 border-red-200",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function OrganizacionPage() {
  const { organization: clerkOrg, isLoaded: clerkLoaded } = useOrganization();
  const clerkOrgId = clerkOrg?.id ?? null;

  const {
    data: org,
    isLoading,
    isError,
    error,
  } = useOrganizationByClerkId(clerkOrgId);

  const updateOrganization = useUpdateOrganization();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveName = async () => {
    if (!org || !nameValue.trim()) return;
    setSaveError(null);
    try {
      await updateOrganization.mutateAsync({
        organizationId: org.id,
        name: nameValue.trim(),
      });
      setEditingName(false);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Error al actualizar el nombre",
      );
    }
  };

  if (!clerkLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2b88a1] border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Error al cargar la organización:{" "}
          {error instanceof Error ? error.message : "Error desconocido"}
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-700">
          No se encontró información de la organización.
        </div>
      </div>
    );
  }

  const usersCount = org.users?.length ?? org._count?.users ?? 0;
  const propertiesCount = org.properties?.length ?? org._count?.properties ?? 0;
  const leadsCount = org.leads?.length ?? org._count?.leads ?? 0;

  return (
    <div className="space-y-8 p-6">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-[#2b88a1]">Organización</h1>
        <p className="mt-2 text-gray-600">
          Gestiona la información general de tu organización.
        </p>
      </div>

      {/* Información general */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Información general
        </h2>

        <div className="mt-6 space-y-5">
          {/* Nombre */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-500">
                Nombre de la organización
              </label>
              {editingName ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2b88a1] focus:outline-none focus:ring-1 focus:ring-[#2b88a1]"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={updateOrganization.isPending}
                    className="rounded-md bg-[#2b88a1] px-3 py-2 text-sm font-medium text-white hover:bg-[#247a91] disabled:opacity-50"
                  >
                    {updateOrganization.isPending ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setNameValue(org.name);
                      setSaveError(null);
                    }}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base text-gray-900">{org.name}</span>
                  <button
                    onClick={() => {
                      setNameValue(org.name);
                      setSaveError(null);
                      setEditingName(true);
                    }}
                    className="text-sm text-[#2b88a1] hover:underline"
                  >
                    Editar
                  </button>
                </div>
              )}
              {saveError && (
                <p className="mt-1 text-sm text-red-600">{saveError}</p>
              )}
            </div>
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Plan
            </label>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-base font-medium text-gray-900">
                {planLabels[org.plan] ?? org.plan}
              </span>
              <span
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${planStatusStyles[org.plan_status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
              >
                {planStatusLabels[org.plan_status] ?? org.plan_status}
              </span>
            </div>
          </div>

          {/* Trial */}
          {org.trial_ends_at && (
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Fecha fin del periodo de prueba
              </label>
              <span className="mt-1 block text-base text-gray-900">
                {formatDate(org.trial_ends_at)}
              </span>
            </div>
          )}

          {/* Fecha de creación */}
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Fecha de creación
            </label>
            <span className="mt-1 block text-base text-gray-900">
              {formatDate(org.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Usuarios</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{usersCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Propiedades</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {propertiesCount}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Leads</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{leadsCount}</p>
        </div>
      </div>

      {/* Miembros */}
      {org.users && org.users.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Miembros</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="pb-3 pr-4 font-medium">Nombre</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Rol</th>
                  <th className="pb-3 font-medium">Desde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {org.users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 pr-4 text-gray-900">
                      {user.name ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {user.email ?? "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "admin"
                            ? "border-blue-200 bg-blue-100 text-blue-700"
                            : "border-gray-200 bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role === "admin" ? "Administrador" : "Agente"}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
