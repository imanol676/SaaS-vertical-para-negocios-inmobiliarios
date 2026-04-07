"use client";

import { useDemo } from "@/src/lib/demo/DemoContext";

export default function DemoPrompt() {
  const { saveConfig, isSavingConfig } = useDemo();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2b88a1]">
          Configuración de Prompt (IA)
        </h1>
        <p className="mt-2 text-gray-600">
          En esta demo puedes ver cómo entrenar a tu IA definiendo pesos y preferencias.
        </p>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); saveConfig(); }}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              1) Peso de variables (1 a 5)
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Presupuesto</label>
                <select defaultValue={5} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]">
                  {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Zona</label>
                <select defaultValue={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]">
                  {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Timeframe</label>
                <select defaultValue={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]">
                  {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              2) Presupuesto objetivo
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div><label className="text-sm">Ideal (USD)</label><input type="number" defaultValue={200000} className="mt-1 w-full rounded-md border p-2 text-sm" /></div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              Guarda los cambios para actualizar los criterios en la Demo.
            </p>
            <button
              type="submit"
              disabled={isSavingConfig}
              className="rounded-md bg-[#2b88a1] px-4 py-2 text-sm font-semibold text-white transition-opacity"
            >
              {isSavingConfig ? "Guardando..." : "Guardar criterios"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
