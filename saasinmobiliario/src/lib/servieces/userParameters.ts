import { Prisma } from "@prisma/client";
import prisma from "../prisma";

interface LeadConfigInput {
  weights: Prisma.InputJsonValue;
  idealBudget: number;
  minimumBudget: number;
  optimumBudget: number;
  timeframeIdeal: string;
  priorityZones: Prisma.InputJsonValue;
}

type SerializableLeadConfig = {
  id: string;
  userId: string;
  weights: Prisma.JsonValue;
  idealBudget: number;
  minimumBudget: number;
  optimumBudget: number;
  timeframeIdeal: string;
  priorityZones: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

type LeadScoringConfigRecord = {
  id: string;
  userId: string;
  weights: Prisma.JsonValue;
  presupuestoIdeal: number;
  presupuestoMinimo: number;
  presupuestoOptimo: number;
  timeframeIdeal: string;
  zonasPrioritarias: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

type LeadScoringConfigDelegate = {
  upsert: (args: {
    where: { userId: string };
    update: {
      weights: Prisma.InputJsonValue;
      presupuestoIdeal: number;
      presupuestoMinimo: number;
      presupuestoOptimo: number;
      timeframeIdeal: string;
      zonasPrioritarias: Prisma.InputJsonValue;
    };
    create: {
      userId: string;
      weights: Prisma.InputJsonValue;
      presupuestoIdeal: number;
      presupuestoMinimo: number;
      presupuestoOptimo: number;
      timeframeIdeal: string;
      zonasPrioritarias: Prisma.InputJsonValue;
    };
  }) => Promise<LeadScoringConfigRecord>;
  findUnique: (args: {
    where: { userId: string };
  }) => Promise<LeadScoringConfigRecord | null>;
};

export class UserParametersService {
  private static getLeadScoringConfigDelegate(): LeadScoringConfigDelegate {
    return (
      prisma as unknown as { leadScoringConfig: LeadScoringConfigDelegate }
    ).leadScoringConfig;
  }

  private static serializeLeadConfig(
    config: LeadScoringConfigRecord,
  ): SerializableLeadConfig {
    return {
      id: config.id,
      userId: config.userId,
      weights: config.weights,
      idealBudget: config.presupuestoIdeal,
      minimumBudget: config.presupuestoMinimo,
      optimumBudget: config.presupuestoOptimo,
      timeframeIdeal: config.timeframeIdeal,
      priorityZones: config.zonasPrioritarias,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  private static validateInput(input: LeadConfigInput) {
    const { minimumBudget, idealBudget, optimumBudget, timeframeIdeal } = input;

    if (
      !Number.isFinite(minimumBudget) ||
      !Number.isFinite(idealBudget) ||
      !Number.isFinite(optimumBudget)
    ) {
      throw new Error("Los presupuestos deben ser números válidos");
    }

    if (minimumBudget < 0 || idealBudget < 0 || optimumBudget < 0) {
      throw new Error("Los presupuestos no pueden ser negativos");
    }

    if (!(minimumBudget <= idealBudget && idealBudget <= optimumBudget)) {
      throw new Error(
        "El presupuesto debe cumplir: mínimo interesante ≤ ideal ≤ óptimo",
      );
    }

    if (!timeframeIdeal || timeframeIdeal.trim().length === 0) {
      throw new Error("El timeframe ideal es obligatorio");
    }

    const zones = input.priorityZones;
    if (!Array.isArray(zones) || zones.length === 0) {
      throw new Error("Debes enviar al menos una zona prioritaria");
    }
  }

  static async createLeadConfig(
    input: LeadConfigInput,
    userId: string,
  ): Promise<SerializableLeadConfig> {
    if (!userId) {
      throw new Error("El userId es obligatorio");
    }

    UserParametersService.validateInput(input);

    const leadScoringConfigDelegate =
      UserParametersService.getLeadScoringConfigDelegate();

    const config = await leadScoringConfigDelegate.upsert({
      where: { userId },
      update: {
        weights: input.weights,
        presupuestoIdeal: Math.trunc(input.idealBudget),
        presupuestoMinimo: Math.trunc(input.minimumBudget),
        presupuestoOptimo: Math.trunc(input.optimumBudget),
        timeframeIdeal: input.timeframeIdeal.trim(),
        zonasPrioritarias: input.priorityZones,
      },
      create: {
        userId,
        weights: input.weights,
        presupuestoIdeal: Math.trunc(input.idealBudget),
        presupuestoMinimo: Math.trunc(input.minimumBudget),
        presupuestoOptimo: Math.trunc(input.optimumBudget),
        timeframeIdeal: input.timeframeIdeal.trim(),
        zonasPrioritarias: input.priorityZones,
      },
    });

    return UserParametersService.serializeLeadConfig(config);
  }

  static async getLeadConfigByUserId(
    userId: string,
  ): Promise<SerializableLeadConfig | null> {
    if (!userId) {
      throw new Error("El userId es obligatorio");
    }

    const leadScoringConfigDelegate =
      UserParametersService.getLeadScoringConfigDelegate();

    const config = await leadScoringConfigDelegate.findUnique({
      where: { userId },
    });

    if (!config) {
      return null;
    }

    return UserParametersService.serializeLeadConfig(config);
  }
}
