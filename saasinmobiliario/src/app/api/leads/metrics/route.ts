import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organization = await prisma.organizations.findUnique({
      where: { clerk_org_id: orgId },
      select: { id: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organización no encontrada" },
        { status: 404 }
      );
    }

    const orgIdDb = organization.id;

    // Dates for aggregations
    const now = new Date();
    
    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);

    const currentWindowStart = new Date(now);
    currentWindowStart.setDate(currentWindowStart.getDate() - 30);

    const previousWindowStart = new Date(now);
    previousWindowStart.setDate(previousWindowStart.getDate() - 60);

    const formatter = new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
    });

    // 1. Total Leads
    const totalLeads = await prisma.leads.count({
      where: { organization_id: orgIdDb },
    });

    // 2. Growth vs Previous Period (30 days vs 60-30 days)
    const currentPeriodCount = await prisma.leads.count({
      where: {
        organization_id: orgIdDb,
        created_at: { gte: currentWindowStart },
      },
    });

    const previousPeriodCount = await prisma.leads.count({
      where: {
        organization_id: orgIdDb,
        created_at: { gte: previousWindowStart, lt: currentWindowStart },
      },
    });

    const growthVsPreviousPeriod =
      previousPeriodCount === 0
        ? currentPeriodCount > 0
          ? 100
          : 0
        : ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100;

    // 3. New Leads Last 7 Days
    const newLeadsLast7Days = await prisma.leads.count({
      where: {
        organization_id: orgIdDb,
        created_at: { gte: last7Days },
      },
    });

    // 4. High Match Leads (Has property_id)
    const highMatchLeads = await prisma.leads.count({
      where: {
        organization_id: orgIdDb,
        property_id: { not: null },
      },
    });
    const highMatchPercent = totalLeads > 0 ? (highMatchLeads / totalLeads) * 100 : 0;

    // 5. Alerts Data
    const leadsWithoutProperty = await prisma.leads.count({
      where: { organization_id: orgIdDb, property_id: null },
    });

    const leadsWithoutScore = await prisma.leads.count({
      where: {
        organization_id: orgIdDb,
        lead_scores: { none: {} },
      },
    });

    // Identify active properties without leads
    const activeProperties = await prisma.properties.findMany({
      where: {
        organization_id: orgIdDb,
        status: { in: ['Active', 'active', 'Activa', 'activa'] },
      },
      select: { id: true, leads: { select: { id: true }, take: 1 } },
    });
    
    const activePropsWithoutLeads = activeProperties.filter(p => p.leads.length === 0).length;

    // 6. High Priority and priority distribution 
    // This part is complex due to getScoreLabel logic checking status string and label string.
    // For exactness to the previous logic, we fetch the necessary fields from leads
    const allLeadsForScoring = await prisma.leads.findMany({
      where: { organization_id: orgIdDb },
      select: { id: true, status: true, created_at: true, lead_scores: { orderBy: { created_at: 'desc' }, take: 1, select: { score: true, label: true } } }
    });

    let highPriorityLeads = 0;
    let bajaCount = 0;
    let mediaCount = 0;

    const daysCounts: Record<string, number> = {};

    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (13 - i));
      const key = d.toISOString().slice(0, 10);
      daysCounts[key] = 0;
    }

    for (const lead of allLeadsForScoring) {
      let priority = "Media";
      if (lead.lead_scores.length > 0) {
        const labelStr = lead.lead_scores[0].label.toLowerCase();
        if (["hot", "alta", "high"].includes(labelStr)) priority = "Alta";
        else if (["cold", "baja", "low"].includes(labelStr)) priority = "Baja";
      } else {
        const s = (lead.status || "").toLowerCase();
        if (s.includes("alta") || s.includes("high") || s.includes("hot")) priority = "Alta";
        else if (s.includes("baja") || s.includes("low") || s.includes("cold")) priority = "Baja";
      }

      if (priority === "Alta") highPriorityLeads++;
      else if (priority === "Baja") bajaCount++;
      else mediaCount++;

      const createdKey = lead.created_at.toISOString().slice(0, 10);
      if (daysCounts[createdKey] !== undefined) {
        daysCounts[createdKey]++;
      }
    }

    const highPriorityPercent = totalLeads > 0 ? (highPriorityLeads / totalLeads) * 100 : 0;
    
    const priorityDistribution = [
      { priority: "Baja", total: bajaCount },
      { priority: "Media", total: mediaCount },
      { priority: "Alta", total: highPriorityLeads },
    ];

    const leadsTrend14Days = Object.keys(daysCounts).map((key) => {
      // Re-hydrate the label
      const [y, m, d] = key.split('-');
      const date = new Date(parseInt(y), parseInt(m)-1, parseInt(d));
      return {
        key,
        label: formatter.format(date),
        leads: daysCounts[key],
      };
    });

    return NextResponse.json({
      metrics: {
        totalLeads,
        growthVsPreviousPeriod,
        newLeadsLast7Days,
        highPriorityLeads,
        highPriorityPercent,
        highMatchLeads,
        highMatchPercent,
      },
      alerts: {
        leadsWithoutProperty,
        leadsWithoutScore,
        activePropsWithoutLeads,
      },
      priorityDistribution,
      leadsTrend14Days
    });

  } catch (error) {
    console.error("Error generating metrics:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las métricas" },
      { status: 500 }
    );
  }
}
