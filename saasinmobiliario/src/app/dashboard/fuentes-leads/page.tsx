"use client";

import { FormEvent, useState } from "react";
import {
  ImportLeadsResponse,
  useImportLeadsFromSheets,
} from "@/src/lib/hooks/useLeads";

type ImportFormData = {
  spreadsheetId: string;
  range: string;
  source: string;
  defaultStatus: string;
};

const initialFormData: ImportFormData = {
  spreadsheetId: "",
  range: "Sheet1!A1:Z5000",
  source: "google_sheets",
  defaultStatus: "new",
};

export default function FuentesLeadsPage() {
  const importMutation = useImportLeadsFromSheets();
  const [formData, setFormData] = useState<ImportFormData>(initialFormData);
  const [result, setResult] = useState<ImportLeadsResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Conectar Google Sheets
        </h2>

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

          <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
            {errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : (
              <p className="text-sm text-gray-500">
                Comparte la hoja con el correo del service account para
                habilitar la lectura.
              </p>
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
