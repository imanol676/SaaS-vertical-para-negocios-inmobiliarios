-- Reconcile drift: table LeadScoringConfig + leads.property_type

CREATE TABLE "LeadScoringConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weights" JSONB NOT NULL,
    "presupuestoIdeal" INTEGER NOT NULL,
    "presupuestoMinimo" INTEGER NOT NULL,
    "presupuestoOptimo" INTEGER NOT NULL,
    "timeframeIdeal" TEXT NOT NULL,
    "zonasPrioritarias" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadScoringConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LeadScoringConfig_userId_key" ON "LeadScoringConfig"("userId");

ALTER TABLE "leads" ADD COLUMN "property_type" TEXT;
