"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type DemoScore = {
  score: number;
  label: "Alta" | "Media" | "Baja";
};

export type DemoLead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  budget: number | null;
  zone: string | null;
  source: string;
  status: string;
  property_id: string | null;
  latest_score: DemoScore | null;
  created_at: string;
};

export type DemoProperty = {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  status: string;
};

type DemoContextType = {
  leads: DemoLead[];
  properties: DemoProperty[];
  scoreLead: (leadId: string) => Promise<void>;
  isScoring: boolean;
};

const initialLeads: DemoLead[] = [
  {
    id: "lead-1",
    name: "María Gómez",
    email: "maria.g@gmail.com",
    phone: "+54 9 11 1234-5678",
    budget: 150000,
    zone: "Palermo",
    source: "Facebook Ads",
    status: "new",
    property_id: null,
    latest_score: null, // Sin score inicial, para jugar en el tour
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "lead-2",
    name: "Carlos Rodríguez",
    email: "rodriguez.c@hotmail.com",
    phone: null,
    budget: 80000,
    zone: "Belgrano",
    source: "Zonaprop",
    status: "contacted",
    property_id: "prop-1",
    latest_score: { score: 45, label: "Baja" },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "lead-3",
    name: "Ana Silva",
    email: "ana.silva92@yahoo.com",
    phone: "+54 9 11 9876-5432",
    budget: 250000,
    zone: "Recoleta",
    source: "Instagram",
    status: "new",
    property_id: null,
    latest_score: { score: 92, label: "Alta" },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "lead-4",
    name: "Demian Stark",
    email: null,
    phone: "+54 9 11 3333-3333",
    budget: 110000,
    zone: "Almagro",
    source: "WhatsApp",
    status: "new",
    property_id: "prop-2",
    latest_score: { score: 68, label: "Media" },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

const initialProperties: DemoProperty[] = [
  {
    id: "prop-1",
    title: "Monoambiente Céntrico",
    location: "Belgrano",
    price: 90000,
    type: "Departamento",
    status: "available",
  },
  {
    id: "prop-2",
    title: "Ph reciclado con terraza",
    location: "Almagro",
    price: 115000,
    type: "PH",
    status: "available",
  },
  {
    id: "prop-3",
    title: "Piso Exclusivo Vista Río",
    location: "Recoleta",
    price: 320000,
    type: "Departamento",
    status: "available",
  },
];

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<DemoLead[]>(initialLeads);
  const [properties] = useState<DemoProperty[]>(initialProperties);
  const [isScoring, setIsScoring] = useState(false);

  const scoreLead = async (leadId: string) => {
    setIsScoring(true);
    // Simular un request de IA
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          // Lógica fake de scoring para el tutorial
          let score = 88;
          let label: "Alta" | "Media" | "Baja" = "Alta";
          
          if (lead.budget && lead.budget < 100000) {
            score = 35;
            label = "Baja";
          }

          return { ...lead, latest_score: { score, label } };
        }
        return lead;
      })
    );
    setIsScoring(false);
  };

  return (
    <DemoContext.Provider value={{ leads, properties, scoreLead, isScoring }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}
