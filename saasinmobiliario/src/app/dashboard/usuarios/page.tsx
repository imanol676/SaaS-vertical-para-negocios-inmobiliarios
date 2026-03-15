"use client";

import { useState } from "react";
import {
  useInvitationsList,
  useCreateInvitation,
  useRevokeInvitation,
  useOrgUsers,
} from "@/src/lib/hooks/useInvitations";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  accepted: "bg-green-100 text-green-700 border-green-200",
  revoked: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  revoked: "Revocada",
};

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  agent: "Agente",
};

export default function UsuariosPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: usersData, isLoading: loadingUsers } = useOrgUsers();
  const { data: invitationsData, isLoading: loadingInvitations } =
    useInvitationsList();
  const createInvitation = useCreateInvitation();
  const revokeInvitation = useRevokeInvitation();

  const users = usersData?.users ?? [];
  const invitations = invitationsData?.invitations ?? [];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Ingresa un email válido");
      return;
    }

    try {
      await createInvitation.mutateAsync(email.trim().toLowerCase());
      setEmail("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al enviar invitación",
      );
    }
  };

  const handleRevoke = async (invitationId: string) => {
    try {
      await revokeInvitation.mutateAsync(invitationId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al revocar invitación",
      );
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2b88a1]">Usuarios</h1>
        <p className="mt-2 text-gray-600">
          Gestiona los usuarios de tu organización e invita nuevos agentes.
        </p>
      </div>

      {/* Formulario de invitación */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Invitar nuevo agente
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Envía una invitación por email. El agente podrá visualizar los leads y
          su scoring.
        </p>

        <form onSubmit={handleInvite} className="mt-4 flex items-end gap-3">
          <div className="flex-1">
            <label
              htmlFor="agent-email"
              className="block text-sm font-medium text-gray-700"
            >
              Email del agente
            </label>
            <input
              id="agent-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agente@ejemplo.com"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#2b88a1] focus:ring-1 focus:ring-[#2b88a1] focus:outline-none"
              disabled={createInvitation.isPending}
            />
          </div>
          <button
            type="submit"
            disabled={createInvitation.isPending || !email.trim()}
            className="rounded-md bg-[#2b88a1] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1e5f73] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createInvitation.isPending ? "Enviando..." : "Enviar invitación"}
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {createInvitation.isSuccess && (
          <p className="mt-3 text-sm text-green-600">
            Invitación enviada correctamente.
          </p>
        )}
      </div>

      {/* Lista de usuarios */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Usuarios de la organización
        </h2>

        {loadingUsers ? (
          <p className="mt-4 text-sm text-gray-500">Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No hay usuarios aún.</p>
        ) : (
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
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      {user.name ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {user.email ?? "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "admin"
                            ? "border-blue-200 bg-blue-100 text-blue-700"
                            : "border-purple-200 bg-purple-100 text-purple-700"
                        }`}
                      >
                        {roleLabels[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(user.created_at).toLocaleDateString("es-ES")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invitaciones pendientes */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Invitaciones enviadas
        </h2>

        {loadingInvitations ? (
          <p className="mt-4 text-sm text-gray-500">Cargando invitaciones...</p>
        ) : invitations.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No hay invitaciones enviadas.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Rol</th>
                  <th className="pb-3 pr-4 font-medium">Estado</th>
                  <th className="pb-3 pr-4 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3 pr-4 text-gray-900">{inv.email}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-block rounded-full border border-purple-200 bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                        Agente
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          statusStyles[inv.status] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabels[inv.status] ?? inv.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">
                      {new Date(inv.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="py-3">
                      {inv.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(inv.id)}
                          disabled={revokeInvitation.isPending}
                          className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Revocar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
