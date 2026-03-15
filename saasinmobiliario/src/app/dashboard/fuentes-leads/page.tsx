"use client";

import { FormEvent, useState } from "react";
import {
  ImportLeadsResponse,
  useImportLeadsFromSheets,
  useCreateLead,
} from "@/src/lib/hooks/useLeads";

type ImportFormData = {
  spreadsheetId: string;
  range: string;
  source: string;
  defaultStatus: string;
};

type ManualLeadData = {
  name: string;
  email: string;
  phone: string;
  budget: string;
  zone: string;
  timeframe: string;
  property_type: string;
};

const initialManualLead: ManualLeadData = {
  name: "",
  email: "",
  phone: "",
  budget: "",
  zone: "",
  timeframe: "",
  property_type: "",
};

const initialFormData: ImportFormData = {
  spreadsheetId: "",
  range: "Sheet1!A1:Z5000",
  source: "google_sheets",
  defaultStatus: "new",
};

export default function FuentesLeadsPage() {
  const importMutation = useImportLeadsFromSheets();
  const createLeadMutation = useCreateLead();
  const [formData, setFormData] = useState<ImportFormData>(initialFormData);
  const [manualLead, setManualLead] =
    useState<ManualLeadData>(initialManualLead);
  const [result, setResult] = useState<ImportLeadsResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualSuccess, setManualSuccess] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const response = await importMutation.mutateAsync({
        spreadsheetId: formData.spreadsheetId.trim(),
        range: formData.range.trim(),
        source: formData.source.trim(),
        defaultStatus: formData.defaultStatus.trim(),
      });

      setResult(response);
    } catch (error) {
      setResult(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Error al importar leads",
      );
    }
  };

  const handleManualSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setManualError(null);
    setManualSuccess(false);

    try {
      await createLeadMutation.mutateAsync({
        name: manualLead.name.trim(),
        email: manualLead.email.trim() || undefined,
        phone: manualLead.phone.trim() || undefined,
        budget: manualLead.budget ? Number(manualLead.budget) : undefined,
        zone: manualLead.zone.trim() || undefined,
        timeframe: manualLead.timeframe.trim() || undefined,
        property_type: manualLead.property_type.trim() || undefined,
        source: "manual",
      });

      setManualLead(initialManualLead);
      setManualSuccess(true);
    } catch (error) {
      setManualError(
        error instanceof Error ? error.message : "Error al crear el lead",
      );
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2b88a1]">Fuentes de Leads</h1>
        <p className="mt-2 text-gray-700">
          Conecta una hoja de cálculo de Google para importar leads de forma
          masiva a tu organización.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Puedes incluir la columna <strong>timeframe</strong> (o{" "}
          <strong>plazo</strong>) para guardar la urgencia/ventana de compra del
          lead.
        </p>
        <p className="mt-1 text-sm text-gray-600">
          También puedes incluir <strong>property_type</strong> (o{" "}
          <strong>tipo propiedad</strong>) para identificar el tipo de inmueble
          buscado.
        </p>
      </div>

      {/* Carga manual de lead */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Agregar lead manualmente
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Completa los datos del lead para añadirlo directamente a tu
          organización.
        </p>

        <form
          className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={handleManualSubmit}
        >
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="manual-name"
            >
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="manual-name"
              type="text"
              value={manualLead.name}
              onChange={(e) =>
                setManualLead((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Nombre del lead"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
              required
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="manual-email"
            >
              Email
            </label>
            <input
              id="manual-email"
              type="email"
              value={manualLead.email}
              onChange={(e) =>
                setManualLead((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="correo@ejemplo.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="manual-phone"
            >
              Teléfono
            </label>
            <input
              id="manual-phone"
              type="tel"
              value={manualLead.phone}
              onChange={(e) =>
                setManualLead((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="+52 55 1234 5678"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="manual-budget"
            >
              Presupuesto
            </label>
            <input
              id="manual-budget"
              type="number"
              min="0"
              step="any"
              value={manualLead.budget}
              onChange={(e) =>
                setManualLead((p) => ({ ...p, budget: e.target.value }))
              }
              placeholder="500000"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="manual-zone"
            >
              Zona
            </label>
            <input
              id="manual-zone"
              type="text"
              value={manualLead.zone}
              onChange={(e) =>
                setManualLead((p) => ({ ...p, zone: e.target.value }))
              }
              placeholder="Ej: Polanco, Roma Norte..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="manual-timeframe"
            >
              Plazo / Urgencia
            </label>
            <select
              id="manual-timeframe"
              value={manualLead.timeframe}
              onChange={(e) =>
                setManualLead((p) => ({ ...p, timeframe: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
            >
              <option value="">Sin especificar</option>
              <option value="inmediato">Inmediato</option>
              <option value="1-3 meses">1-3 meses</option>
              <option value="3-6 meses">3-6 meses</option>
              <option value="6-12 meses">6-12 meses</option>
              <option value="más de 1 año">Más de 1 año</option>
            </select>
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="manual-property-type"
            >
              Tipo de propiedad
            </label>
            <select
              id="manual-property-type"
              value={manualLead.property_type}
              onChange={(e) =>
                setManualLead((p) => ({ ...p, property_type: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
            >
              <option value="">Sin especificar</option>
              <option value="casa">Casa</option>
              <option value="departamento">Departamento</option>
              <option value="terreno">Terreno</option>
              <option value="oficina">Oficina</option>
              <option value="local comercial">Local comercial</option>
              <option value="bodega">Bodega</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
            {manualError && (
              <p className="text-sm text-red-600">{manualError}</p>
            )}
            {manualSuccess && (
              <p className="text-sm text-green-600">
                Lead creado exitosamente.
              </p>
            )}
            {!manualError && !manualSuccess && <span />}

            <button
              type="submit"
              disabled={createLeadMutation.isPending}
              className="rounded-md bg-[#2b88a1] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createLeadMutation.isPending ? "Guardando..." : "Agregar lead"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Conectar Google Sheets
        </h2>

        {/* Guía visual de instrucciones */}
        <div className="mb-8 p-5 bg-[#2b88a1]/5 rounded-xl border border-[#2b88a1]/20">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
            <span className="bg-[#2b88a1] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">i</span>
            ¿Cómo conectar tu hoja de cálculo?
          </h3>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-start">
              <span className="font-bold text-slate-900 mr-2">1.</span>
              <div>
                <p><strong>Copia e invita</strong> a este correo electrónico como <span className="font-semibold px-1.5 py-0.5 bg-slate-100 rounded">Lector</span> en tu Google Sheet (botón "Compartir" de Google):</p>
                <div className="mt-2 flex items-center">
                  <code className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[#2b88a1] font-mono select-all">estateos@estateos-488619.iam.gserviceaccount.com</code>
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-bold text-slate-900 mr-2">2.</span>
              <div>
                <p><strong>Identifica el Spreadsheet ID:</strong> Es el código largo que se encuentra en la URL de tu hoja. <br/> Ejemplo: <code>docs.google.com/spreadsheets/d/<strong>1AbC-DefGh...</strong>/edit</code></p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-bold text-slate-900 mr-2">3.</span>
              <div>
                <p><strong>Orden de columnas (recomendado):</strong> Nombre, Email, Teléfono, Presupuesto, Zona, Plazo, Tipo Propiedad.</p>
              </div>
            </div>
          </div>
        </div>

        <form
          className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <div className="md:col-span-2">
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="spreadsheetId"
            >
              Spreadsheet ID
            </label>
            <input
              id="spreadsheetId"
              type="text"
              value={formData.spreadsheetId}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  spreadsheetId: event.target.value,
                }))
              }
              placeholder="Ej: 1AbCDefGh..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
              required
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="range"
            >
              Rango
            </label>
            <input
              id="range"
              type="text"
              value={formData.range}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  range: event.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="source"
            >
              Fuente
            </label>
            <input
              id="source"
              type="text"
              value={formData.source}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  source: event.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="defaultStatus"
            >
              Estado por defecto
            </label>
            <input
              id="defaultStatus"
              type="text"
              value={formData.defaultStatus}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  defaultStatus: event.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
            {errorMessage ? (
              <p className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-100">{errorMessage}</p>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={importMutation.isPending}
              className="rounded-md bg-[#2b88a1] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {importMutation.isPending ? "Importando..." : "Importar leads"}
            </button>
          </div>
        </form>
      </section>

      {result ? (
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Resultado de importación
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            <div className="rounded-md bg-gray-50 p-3 text-sm">
              <p className="text-gray-500">Filas leídas</p>
              <p className="font-semibold text-gray-900">
                {result.summary.totalRows}
              </p>
            </div>
            <div className="rounded-md bg-green-50 p-3 text-sm">
              <p className="text-green-700">Creados</p>
              <p className="font-semibold text-green-900">
                {result.summary.created}
              </p>
            </div>
            <div className="rounded-md bg-blue-50 p-3 text-sm">
              <p className="text-blue-700">Actualizados</p>
              <p className="font-semibold text-blue-900">
                {result.summary.updated}
              </p>
            </div>
            <div className="rounded-md bg-yellow-50 p-3 text-sm">
              <p className="text-yellow-700">Omitidos</p>
              <p className="font-semibold text-yellow-900">
                {result.summary.skipped}
              </p>
            </div>
            <div className="rounded-md bg-red-50 p-3 text-sm">
              <p className="text-red-700">Fallidos</p>
              <p className="font-semibold text-red-900">
                {result.summary.failed}
              </p>
            </div>
          </div>

          {result.errors.length > 0 ? (
            <div className="mt-5 rounded-md border border-red-100 bg-red-50 p-4">
              <h3 className="text-sm font-semibold text-red-800">
                Errores por fila
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-red-700">
                {result.errors.map((item) => (
                  <li key={`${item.row}-${item.reason}`}>
                    Fila {item.row}: {item.reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
