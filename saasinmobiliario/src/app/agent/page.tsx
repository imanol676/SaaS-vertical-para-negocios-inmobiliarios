"use client";

import { useUser } from "@clerk/nextjs";

export default function AgentHome() {
  const { user } = useUser();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2b88a1]">
          Bienvenido, {user?.firstName ?? "Agente"}
        </h1>
        <p className="mt-2 text-gray-600">
          Desde este panel puedes visualizar los leads asignados y su
          información de scoring.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Panel de agente</h2>
          <p className="mt-2 text-sm text-gray-700">
            Accede a la sección de{" "}
            <span className="font-semibold text-[#2b88a1]">Leads</span> para ver
            todos los leads disponibles, su puntuación de IA y la explicación
            detallada del scoring.
          </p>
        </div>
      </div>
    </div>
  );
}
