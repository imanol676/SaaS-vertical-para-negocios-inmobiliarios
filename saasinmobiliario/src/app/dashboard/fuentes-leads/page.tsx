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
            <span className="bg-[#2b88a1] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
              i
            </span>
            ¿Cómo conectar tu hoja de cálculo?
          </h3>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-start">
              <span className="font-bold text-slate-900 mr-2">1.</span>
              <div>
                <p>
                  <strong>Copia e invita</strong> a este correo electrónico como{" "}
                  <span className="font-semibold px-1.5 py-0.5 bg-slate-100 rounded">
                    Lector
                  </span>{" "}
                  en tu Google Sheet (botón &quot;Compartir&quot; de Google):
                </p>
                <div className="mt-2 flex items-center">
                  <code className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[#2b88a1] font-mono select-all">
                    estateos@estateos-488619.iam.gserviceaccount.com
                  </code>
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-bold text-slate-900 mr-2">2.</span>
              <div>
                <p>
                  <strong>Identifica el Spreadsheet ID:</strong> Es el código
                  largo que se encuentra en la URL de tu hoja. <br /> Ejemplo:{" "}
                  <code>
                    docs.google.com/spreadsheets/d/
                    <strong>1AbC-DefGh...</strong>/edit
                  </code>
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-bold text-slate-900 mr-2">3.</span>
              <div>
                <p>
                  <strong>Orden de columnas (recomendado):</strong> Nombre,
                  Email, Teléfono, Presupuesto, Zona, Plazo, Tipo Propiedad.
                </p>
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
              <p className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                {errorMessage}
              </p>
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

      {/* Integraciones Futuras */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm opacity-80">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Conexiones en tiempo real <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Próximamente</span>
        </h2>
        <p className="mt-1 text-sm text-gray-500 mb-6">
          Estamos trabajando en integraciones directas con las plataformas más populares para que tus leads lleguen automáticamente y nuestra IA extraiga sus preferencias.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* WhatsApp */}
          <div className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-gray-50 px-6 py-5 shadow-sm opacity-70">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <span className="focus:outline-none">
                <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                <p className="truncate text-sm text-gray-500">Recibe y procesa mensajes</p>
              </span>
            </div>
            <div className="flex-shrink-0">
               <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">En desarrollo</span>
            </div>
          </div>

          {/* Instagram */}
          <div className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-gray-50 px-6 py-5 shadow-sm opacity-70">
            <div className="flex-shrink-0">
               <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <span className="focus:outline-none">
                <p className="text-sm font-medium text-gray-900">Instagram Direct</p>
                <p className="truncate text-sm text-gray-500">Convierte DMs en prospectos</p>
              </span>
            </div>
            <div className="flex-shrink-0">
               <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">En desarrollo</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
