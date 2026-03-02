import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { getGoogleSheetsClient } from "../googleSheets";

type GoogleApiLikeError = {
  code?: number;
  status?: number;
  message?: string;
  response?: {
    status?: number;
    data?: {
      error?: {
        message?: string;
      };
    };
  };
};

type ImportLeadsParams = {
  spreadsheetId: string;
  organizationClerkId: string;
  range?: string;
  source?: string;
  defaultStatus?: string;
};

type ImportedLead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  budget: number | null;
  zone: string | null;
  timeframe: string | null;
  property_type: string | null;
  status: string;
  source: string;
  created_at: Date;
  updated_at: Date;
};

type ImportLeadsResult = {
  leads: ImportedLead[];
  summary: {
    totalRows: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  errors: Array<{ row: number; reason: string }>;
};

export class ImportLeadsError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ImportLeadsError";
    this.status = status;
  }
}

const DEFAULT_RANGE = "Sheet1!A1:Z5000";
const DEFAULT_SOURCE = "google_sheets";
const DEFAULT_STATUS = "new";

const quoteSheetTitle = (title: string) => `'${title.replace(/'/g, "''")}'`;

const isGoogleApiLikeError = (error: unknown): error is GoogleApiLikeError => {
  return !!error && typeof error === "object";
};

const normalizeHeader = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const normalizeText = (value?: string) => {
  if (!value) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const normalizeEmail = (value?: string) => {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return normalized.toLowerCase();
};

const normalizePhone = (value?: string) => {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return normalized.replace(/\s+/g, "");
};

const parseBudget = (value?: string): Prisma.Decimal | undefined => {
  const normalized = normalizeText(value);
  if (!normalized) return undefined;

  const numericString = normalized.replace(/[^0-9.,-]/g, "").replace(/,/g, "");
  if (!numericString) {
    throw new Error("Budget inválido");
  }

  const parsed = Number(numericString);
  if (Number.isNaN(parsed)) {
    throw new Error("Budget inválido");
  }

  return new Prisma.Decimal(parsed);
};

const toSerializableLead = (lead: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  budget: Prisma.Decimal | null;
  zone: string | null;
  timeframe: string | null;
  property_type?: string | null;
  status: string;
  source: string;
  created_at: Date;
  updated_at: Date;
}): ImportedLead => ({
  id: lead.id,
  name: lead.name,
  email: lead.email,
  phone: lead.phone,
  budget: lead.budget ? Number(lead.budget) : null,
  zone: lead.zone,
  timeframe: lead.timeframe,
  property_type: lead.property_type ?? null,
  status: lead.status,
  source: lead.source,
  created_at: lead.created_at,
  updated_at: lead.updated_at,
});

const getColumnIndex = (headers: string[], aliases: string[]) => {
  const headerIndex = new Map(
    headers.map((header, index) => [normalizeHeader(header), index]),
  );

  for (const alias of aliases) {
    const index = headerIndex.get(normalizeHeader(alias));
    if (index !== undefined) return index;
  }

  return -1;
};

export async function importLeads({
  spreadsheetId,
  organizationClerkId,
  range = DEFAULT_RANGE,
  source = DEFAULT_SOURCE,
  defaultStatus = DEFAULT_STATUS,
}: ImportLeadsParams): Promise<ImportLeadsResult> {
  const sheets = getGoogleSheetsClient();
  let effectiveRange = range;

  const organization = await prisma.organizations.findUnique({
    where: { clerk_org_id: organizationClerkId },
    select: { id: true },
  });

  if (!organization) {
    throw new ImportLeadsError("Organización no encontrada", 404);
  }

  let response;
  try {
    response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: effectiveRange,
    });
  } catch (error) {
    if (isGoogleApiLikeError(error)) {
      const status = error.code ?? error.status ?? error.response?.status;
      const apiMessage =
        error.response?.data?.error?.message ??
        error.message ??
        "Error en Google Sheets";

      if (status === 403) {
        const serviceAccount = process.env.GOOGLE_CLIENT_EMAIL;
        const shareHint = serviceAccount
          ? `Comparte la hoja con: ${serviceAccount}`
          : "Verifica que la hoja esté compartida con tu Service Account";

        throw new ImportLeadsError(
          `Google Sheets rechazó el acceso (403). ${shareHint}. Mensaje: ${apiMessage}`,
          403,
        );
      }

      if (status === 404) {
        throw new ImportLeadsError(
          "No se encontró la hoja o el rango especificado en Google Sheets.",
          404,
        );
      }

      if (status === 400) {
        const isRangeParseError =
          typeof apiMessage === "string" &&
          apiMessage.toLowerCase().includes("unable to parse range");

        if (isRangeParseError) {
          try {
            const spreadsheetInfo = await sheets.spreadsheets.get({
              spreadsheetId,
              fields: "sheets.properties.title",
            });

            const firstSheetTitle =
              spreadsheetInfo.data.sheets?.[0]?.properties?.title;

            if (firstSheetTitle) {
              const fallbackBaseRange = effectiveRange.includes("!")
                ? effectiveRange.split("!")[1]
                : effectiveRange;

              effectiveRange = `${quoteSheetTitle(firstSheetTitle)}!${fallbackBaseRange}`;

              response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: effectiveRange,
              });

              // Si el retry funcionó, continuamos con el flujo normal
              // evitando lanzar el error 400 original.
            } else {
              throw new ImportLeadsError(
                `Solicitud inválida a Google Sheets: ${apiMessage}`,
                400,
              );
            }
          } catch {
            throw new ImportLeadsError(
              `Solicitud inválida a Google Sheets: ${apiMessage}`,
              400,
            );
          }

          if (!response) {
            throw new ImportLeadsError(
              `Solicitud inválida a Google Sheets: ${apiMessage}`,
              400,
            );
          }
        } else {
          throw new ImportLeadsError(
            `Solicitud inválida a Google Sheets: ${apiMessage}`,
            400,
          );
        }
      }
    }

    if (!response) {
      throw new ImportLeadsError(
        error instanceof Error
          ? `Error consultando Google Sheets: ${error.message}`
          : "Error consultando Google Sheets",
        502,
      );
    }
  }

  const rows = response.data.values;
  if (!rows || rows.length < 2) {
    return {
      leads: [],
      summary: { totalRows: 0, created: 0, updated: 0, skipped: 0, failed: 0 },
      errors: [],
    };
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);

  const nameIndex = getColumnIndex(headers, [
    "name",
    "nombre",
    "lead",
    "cliente",
  ]);
  const emailIndex = getColumnIndex(headers, ["email", "correo", "mail"]);
  const phoneIndex = getColumnIndex(headers, [
    "phone",
    "telefono",
    "teléfono",
    "celular",
    "whatsapp",
  ]);
  const budgetIndex = getColumnIndex(headers, [
    "budget",
    "presupuesto",
    "monto",
  ]);
  const zoneIndex = getColumnIndex(headers, ["zone", "zona", "area", "área"]);
  const timeframeIndex = getColumnIndex(headers, [
    "timeframe",
    "plazo",
    "tiempo",
    "urgencia",
  ]);
  const propertyTypeIndex = getColumnIndex(headers, [
    "property_type",
    "property type",
    "tipo_propiedad",
    "tipo propiedad",
    "tipo_de_propiedad",
    "tipo",
    "inmueble",
  ]);
  const statusIndex = getColumnIndex(headers, ["status", "estado"]);
  const sourceIndex = getColumnIndex(headers, ["source", "fuente", "origen"]);

  if (nameIndex === -1) {
    throw new ImportLeadsError(
      "La hoja no contiene columna de nombre. Usa un encabezado como 'name' o 'nombre'.",
      400,
    );
  }

  const importedLeads: ImportedLead[] = [];
  const errors: Array<{ row: number; reason: string }> = [];

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let index = 0; index < dataRows.length; index++) {
    const row = dataRows[index];
    const rowNumber = index + 2;

    const rawName = row[nameIndex];
    const rawEmail = emailIndex >= 0 ? row[emailIndex] : undefined;
    const rawPhone = phoneIndex >= 0 ? row[phoneIndex] : undefined;
    const rawBudget = budgetIndex >= 0 ? row[budgetIndex] : undefined;
    const rawZone = zoneIndex >= 0 ? row[zoneIndex] : undefined;
    const rawTimeframe = timeframeIndex >= 0 ? row[timeframeIndex] : undefined;
    const rawPropertyType =
      propertyTypeIndex >= 0 ? row[propertyTypeIndex] : undefined;
    const rawStatus = statusIndex >= 0 ? row[statusIndex] : undefined;
    const rawSource = sourceIndex >= 0 ? row[sourceIndex] : undefined;

    const name = normalizeText(rawName);
    const email = normalizeEmail(rawEmail);
    const phone = normalizePhone(rawPhone);
    const zone = normalizeText(rawZone);
    const timeframe = normalizeText(rawTimeframe);
    const propertyType = normalizeText(rawPropertyType);
    const status = normalizeText(rawStatus) ?? defaultStatus;
    const leadSource = normalizeText(rawSource) ?? source;

    if (!name && !email && !phone) {
      skipped++;
      continue;
    }

    if (!name) {
      errors.push({ row: rowNumber, reason: "El nombre es obligatorio" });
      continue;
    }

    let budget: Prisma.Decimal | undefined;
    try {
      budget = parseBudget(rawBudget);
    } catch (error) {
      errors.push({
        row: rowNumber,
        reason: error instanceof Error ? error.message : "Budget inválido",
      });
      continue;
    }

    const rawPayload = {
      spreadsheetId,
      range: effectiveRange,
      rowNumber,
      row,
      importedAt: new Date().toISOString(),
    };

    const whereCandidates = [
      ...(email ? [{ email }] : []),
      ...(phone ? [{ phone }] : []),
      ...(!email && !phone ? [{ name, zone, timeframe }] : []),
    ];

    const existingLead =
      whereCandidates.length > 0
        ? await prisma.leads.findFirst({
            where: {
              organization_id: organization.id,
              OR: whereCandidates,
            },
            orderBy: { updated_at: "desc" },
          })
        : null;

    if (existingLead) {
      const existingPropertyType = (
        existingLead as { property_type?: string | null }
      ).property_type;
      const resolvedPropertyType = propertyType ?? existingPropertyType ?? null;

      const updateData: Record<string, unknown> = {
        source: leadSource,
        name,
        email: email ?? existingLead.email,
        phone: phone ?? existingLead.phone,
        zone: zone ?? existingLead.zone,
        timeframe: timeframe ?? existingLead.timeframe,
        budget: budget ?? existingLead.budget,
        status,
        raw_payload: rawPayload,
      };

      if (resolvedPropertyType) {
        updateData.property_type = resolvedPropertyType;
      }

      const updatedLead = await prisma.leads.update({
        where: { id: existingLead.id },
        data: updateData as Prisma.LeadsUncheckedUpdateInput,
      });

      importedLeads.push(toSerializableLead(updatedLead));
      updated++;
      continue;
    }

    const createData: Record<string, unknown> = {
      organization_id: organization.id,
      source: leadSource,
      name,
      email,
      phone,
      budget,
      zone,
      timeframe,
      raw_payload: rawPayload,
      status,
    };

    if (propertyType) {
      createData.property_type = propertyType;
    }

    const createdLead = await prisma.leads.create({
      data: createData as Prisma.LeadsUncheckedCreateInput,
    });

    importedLeads.push(toSerializableLead(createdLead));
    created++;
  }

  return {
    leads: importedLeads,
    summary: {
      totalRows: dataRows.length,
      created,
      updated,
      skipped,
      failed: errors.length,
    },
    errors,
  };
}
