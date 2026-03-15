import { Prisma } from "@prisma/client";
import prisma from "../prisma";

export interface LeadScoringInput {
  leadId: string;
  score: number;
  label: string;
  explanation: Prisma.InputJsonValue;
  modelVersion: string;
}

export type SerializedLeadScoring = {
  id: string;
  leadId: string;
  score: number;
  label: string;
  explanation: Prisma.JsonValue;
  modelVersion: string;
  createdAt: Date;
};

export async function createLeadScoring(
  input: LeadScoringInput,
): Promise<SerializedLeadScoring> {
  const row = await prisma.leadScores.create({
    data: {
      lead_id: input.leadId,
      score: input.score,
      label: input.label,
      explanation: input.explanation,
      model_version: input.modelVersion,
    },
  });

  return {
    id: row.id,
    leadId: row.lead_id,
    score: row.score,
    label: row.label,
    explanation: row.explanation,
    modelVersion: row.model_version,
    createdAt: row.created_at,
  };
}
