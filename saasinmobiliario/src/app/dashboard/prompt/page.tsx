"use client";

import { FormEvent, useState } from "react";
import {
  type LeadConfig,
  useLeadConfig,
  useSaveLeadConfig,
} from "@/src/lib/hooks/useLeadConfig";

type VariableKey = "budget" | "zone" | "timeframe" | "source";

type PrioritizationConfig = {
  weights: Record<VariableKey, number>;
  budget: {
    minimumInteresting: string;
    ideal: string;
    optimal: string;
  };
  idealTimeframe: string;
  priorityZones: string[];
};

const initialConfig: PrioritizationConfig = {
  weights: {
    budget: 3,
    zone: 3,
    timeframe: 3,
    source: 3,
  },
  budget: {
    minimumInteresting: "",
    ideal: "",
    optimal: "",
  },
  idealTimeframe: "",
  priorityZones: [],
};

const WEIGHT_OPTIONS = [1, 2, 3, 4, 5];

const TIMEFRAME_OPTIONS = [
  "Inmediato",
  "0-1 mes",
  "1-3 meses",
  "3-6 meses",
  "6+ meses",
];

export default function PromptConfig() {
  const {
    data: storedConfig,
    isLoading: isConfigLoading,
    isError: isConfigError,
    error: configError,
  } = useLeadConfig();
  const saveLeadConfigMutation = useSaveLeadConfig();

  const [localConfig, setLocalConfig] = useState<PrioritizationConfig | null>(
    null,
  );
  const [zoneInput, setZoneInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fallbackConfig = storedConfig
    ? mapStoredConfigToForm(storedConfig)
    : initialConfig;

  const config = localConfig ?? fallbackConfig;

  const updateConfig = (
    updater: (previous: PrioritizationConfig) => PrioritizationConfig,
  ) => {
    setLocalConfig((previous) => updater(previous ?? fallbackConfig));
  };

  const handleWeightChange = (variable: VariableKey, value: string) => {
    updateConfig((previous) => ({
      ...previous,
      weights: {
        ...previous.weights,
        [variable]: Number(value),
      },
    }));
  };

  const handleBudgetChange = (
    field: "minimumInteresting" | "ideal" | "optimal",
    value: string,
  ) => {
    updateConfig((previous) => ({
      ...previous,
      budget: {
        ...previous.budget,
        [field]: value,
      },
    }));
  };

  const handleAddZone = () => {
    const normalizedZone = zoneInput.trim();
    if (!normalizedZone) {
      return;
    }

    const alreadyExists = config.priorityZones.some(
      (zone) => zone.toLowerCase() === normalizedZone.toLowerCase(),
    );

    if (alreadyExists) {
      setZoneInput("");
      return;
    }

    updateConfig((previous) => ({
      ...previous,
      priorityZones: [...previous.priorityZones, normalizedZone],
    }));
    setZoneInput("");
  };

  const handleRemoveZone = (zoneToDelete: string) => {
    updateConfig((previous) => ({
      ...previous,
      priorityZones: previous.priorityZones.filter(
        (zone) => zone !== zoneToDelete,
      ),
    }));
  };

  const validateForm = () => {
    const minimumInteresting = Number(config.budget.minimumInteresting);
    const ideal = Number(config.budget.ideal);
    const optimal = Number(config.budget.optimal);

    const hasBudgetFields =
      config.budget.minimumInteresting !== "" &&
      config.budget.ideal !== "" &&
      config.budget.optimal !== "";

    if (!hasBudgetFields) {
      return "Completa los tres campos de presupuesto.";
    }

    if (
      !Number.isFinite(minimumInteresting) ||
      !Number.isFinite(ideal) ||
      !Number.isFinite(optimal)
    ) {
      return "Los valores de presupuesto deben ser números válidos.";
    }

    if (minimumInteresting < 0 || ideal < 0 || optimal < 0) {
      return "Los valores de presupuesto no pueden ser negativos.";
    }

    if (!(minimumInteresting <= ideal && ideal <= optimal)) {
      return "El presupuesto debe cumplir: mínimo interesante ≤ ideal ≤ óptimo.";
    }

    if (!config.idealTimeframe) {
      return "Selecciona un timeframe ideal.";
    }

    if (config.priorityZones.length === 0) {
      return "Agrega al menos una zona prioritaria.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      await saveLeadConfigMutation.mutateAsync({
        weights: {
          budget: config.weights.budget,
          zone: config.weights.zone,
          timeframe: config.weights.timeframe,
          source: config.weights.source,
        },
        minimumBudget: Number(config.budget.minimumInteresting),
        idealBudget: Number(config.budget.ideal),
        optimumBudget: Number(config.budget.optimal),
        timeframeIdeal: config.idealTimeframe,
        priorityZones: config.priorityZones,
      });

      setSuccessMessage("Configuración actualizada correctamente.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la configuración",
      );
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2b88a1]">
          Configuración de Prompt
        </h1>
        <p className="mt-2 text-gray-600">
          Define cómo priorizar tus leads según pesos, presupuesto, timeframe y
          zonas de interés.
        </p>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {isConfigLoading ? (
          <p className="mb-4 text-sm text-gray-500">
            Cargando configuración...
          </p>
        ) : null}

        {isConfigError ? (
          <p className="mb-4 text-sm text-red-600">
            {configError instanceof Error
              ? configError.message
              : "No se pudo cargar la configuración actual."}
          </p>
        ) : null}

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              1) Peso de variables (1 a 5)
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="weight-budget"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Presupuesto
                </label>
                <select
                  id="weight-budget"
                  value={config.weights.budget}
                  onChange={(event) =>
                    handleWeightChange("budget", event.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
                >
                  {WEIGHT_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="weight-zone"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Zona
                </label>
                <select
                  id="weight-zone"
                  value={config.weights.zone}
                  onChange={(event) =>
                    handleWeightChange("zone", event.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
                >
                  {WEIGHT_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="weight-timeframe"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Timeframe
                </label>
                <select
                  id="weight-timeframe"
                  value={config.weights.timeframe}
                  onChange={(event) =>
                    handleWeightChange("timeframe", event.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
                >
                  {WEIGHT_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="weight-source"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Fuente
                </label>
                <select
                  id="weight-source"
                  value={config.weights.source}
                  onChange={(event) =>
                    handleWeightChange("source", event.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
                >
                  {WEIGHT_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              2) Presupuesto objetivo
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label
                  htmlFor="minimum-interesting"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Mínimo interesante
                </label>
                <input
                  id="minimum-interesting"
                  type="number"
                  min="0"
                  value={config.budget.minimumInteresting}
                  onChange={(event) =>
                    handleBudgetChange("minimumInteresting", event.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
                  placeholder="Ej: 80000"
                />
              </div>

              <div>
                <label
                  htmlFor="ideal-budget"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Ideal
                </label>
                <input
                  id="ideal-budget"
                  type="number"
                  min="0"
                  value={config.budget.ideal}
                  onChange={(event) =>
                    handleBudgetChange("ideal", event.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
                  placeholder="Ej: 120000"
                />
              </div>

              <div>
                <label
                  htmlFor="optimal-budget"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Óptimo
                </label>
                <input
                  id="optimal-budget"
                  type="number"
                  min="0"
                  value={config.budget.optimal}
                  onChange={(event) =>
                    handleBudgetChange("optimal", event.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
                  placeholder="Ej: 150000"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              3) Timeframe ideal
            </h2>
            <div className="max-w-md">
              <label
                htmlFor="ideal-timeframe"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Selecciona el timeframe ideal de compra
              </label>
              <select
                id="ideal-timeframe"
                value={config.idealTimeframe}
                onChange={(event) =>
                  updateConfig((previous) => ({
                    ...previous,
                    idealTimeframe: event.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>
                {TIMEFRAME_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              4) Zonas con mayor prioridad
            </h2>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:max-w-md">
                <label
                  htmlFor="priority-zone"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Zona
                </label>
                <input
                  id="priority-zone"
                  type="text"
                  value={zoneInput}
                  onChange={(event) => setZoneInput(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
                  placeholder="Ej: Polanco"
                />
              </div>

              <button
                type="button"
                onClick={handleAddZone}
                className="rounded-md border border-[#2b88a1] px-4 py-2 text-sm font-semibold text-[#2b88a1]"
              >
                Agregar zona
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {config.priorityZones.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aún no hay zonas prioritarias agregadas.
                </p>
              ) : (
                config.priorityZones.map((zone) => (
                  <span
                    key={zone}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700"
                  >
                    {zone}
                    <button
                      type="button"
                      onClick={() => handleRemoveZone(zone)}
                      className="font-semibold text-gray-500 hover:text-gray-800"
                      aria-label={`Quitar ${zone}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            {errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : successMessage ? (
              <p className="text-sm text-green-700">{successMessage}</p>
            ) : (
              <p className="text-sm text-gray-500">
                Guarda los cambios para actualizar los criterios de
                priorización.
              </p>
            )}

            <button
              type="submit"
              disabled={saveLeadConfigMutation.isPending}
              className="rounded-md bg-[#2b88a1] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveLeadConfigMutation.isPending
                ? "Guardando..."
                : "Guardar criterios"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function mapStoredConfigToForm(storedConfig: LeadConfig): PrioritizationConfig {
  return {
    weights: {
      budget: Number(storedConfig.weights?.budget ?? 3),
      zone: Number(storedConfig.weights?.zone ?? 3),
      timeframe: Number(storedConfig.weights?.timeframe ?? 3),
      source: Number(storedConfig.weights?.source ?? 3),
    },
    budget: {
      minimumInteresting: String(storedConfig.minimumBudget ?? ""),
      ideal: String(storedConfig.idealBudget ?? ""),
      optimal: String(storedConfig.optimumBudget ?? ""),
    },
    idealTimeframe: storedConfig.timeframeIdeal ?? "",
    priorityZones: Array.isArray(storedConfig.priorityZones)
      ? storedConfig.priorityZones
      : [],
  };
}
