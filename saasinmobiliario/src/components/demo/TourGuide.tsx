"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDemo } from "@/src/lib/demo/DemoContext";
import { ArrowRight, Sparkles, X, CheckCircle2, Download, Settings, Bot } from "lucide-react";

export function TourGuide() {
  const pathname = usePathname();
  const router = useRouter();
  const { leads, hasImportedLeads, hasSavedConfig } = useDemo();
  
  const [step, setStep] = useState(1);
  const [isOpen, setIsOpen] = useState(true);

  // Auto-advance step based on pathname and context state
  useEffect(() => {
    if (pathname === "/demo") {
      setStep(1); // Inicio
    } else if (pathname === "/demo/fuentes-leads") {
      if (hasImportedLeads) {
        setStep(3); // Ya importó -> invitar a config
      } else {
        setStep(2); // Debe importar
      }
    } else if (pathname === "/demo/prompt") {
      if (hasSavedConfig) {
        setStep(5); // Ya guardó -> ir a leads
      } else {
        setStep(4); // Debe configurar
      }
    } else if (pathname === "/demo/leads") {
       const lead = leads.find((l) => l.id === "lead-new-1");
       // Si existe y ya tiene score
       if (lead && lead.latest_score) {
         setStep(7); // Fin
       } else {
         setStep(6); // Evaluar
       }
    }
  }, [pathname, leads, hasImportedLeads, hasSavedConfig]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm rounded-xl border border-[#2b88a1]/20 bg-white p-5 shadow-2xl overflow-hidden transition-all duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2b88a1]/10 to-transparent -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />

      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 text-[#2b88a1] mb-3 relative z-10">
        <Sparkles className="w-5 h-5 animate-pulse" />
        <h3 className="font-bold text-lg">Tour Interactivo</h3>
      </div>

      <div className="relative z-10 space-y-4">
        {step === 1 && (
          <>
            <p className="text-gray-600 text-sm">
              <strong className="text-gray-900 block mb-1">¡Bienvenido a EstateOS!</strong>
              Aquí ves un resumen inteligente de tu negocio.
            </p>
            <p className="text-gray-600 text-sm">
              Para nutrir este dashboard, primero debemos importar prospectos. Vamos a hacerlo.
            </p>
            <button
              onClick={() => router.push("/demo/fuentes-leads")}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-[#2b88a1] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e5f73] transition-colors"
            >
              Ir a Fuentes de Leads
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-gray-600 text-sm">
              <strong className="text-gray-900 block mb-1">Conecta tus fuentes</strong>
              EstateOS se conecta a tus Google Sheets u otras fuentes automáticamente.
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-amber-800 text-xs font-medium flex gap-2 items-start">
                <span>👉</span> Haz clic en <strong className="font-bold inline-flex items-center gap-1 border border-amber-200 px-1 rounded bg-white"><Download className="w-3 h-3" /> Sincronizar</strong> en la caja de Google Sheets para importar leads falsos ahora mismo.
              </p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold">¡Leads Importados!</span>
            </div>
            <p className="text-gray-600 text-sm">
              Ya hemos inyectado nuevos prospectos al sistema.
            </p>
            <p className="text-gray-600 text-sm">
              Ahora, dile a la Inteligencia Artificial cómo debe evaluarlos según lo que le importa a tu negocio.
            </p>
            <button
              onClick={() => router.push("/demo/prompt")}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-[#2b88a1] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e5f73] transition-colors"
            >
              Configurar IA
              <Settings className="w-4 h-4" />
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <p className="text-gray-600 text-sm">
              <strong className="text-gray-900 block mb-1">Entrena a la IA</strong>
              Indícale qué peso darle al presupuesto, zona o timeframe de compra.
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-amber-800 text-xs font-medium">
                👉 Modifica algunos valores (ej: cambia el peso del Presupuesto a 5) y presiona <strong className="font-bold bg-white border px-1 rounded">Guardar criterios</strong> debajo.
              </p>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold">Configuración guardada</span>
            </div>
            <p className="text-gray-600 text-sm">
              La IA ya conoce tus preferencias comerciales.
            </p>
            <p className="text-gray-600 text-sm">
              Veamos cómo castiga o premia a los leads recién importados aplicando estas reglas.
            </p>
            <button
              onClick={() => router.push("/demo/leads")}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-[#2b88a1] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e5f73] transition-colors"
            >
              Ver mis Leads calificados
              <Bot className="w-4 h-4" />
            </button>
          </>
        )}

        {step === 6 && (
          <>
            <p className="text-gray-600 text-sm">
              <strong className="text-gray-900 block mb-1">Scoring Automático</strong>
              Busca al nuevo lead "Javier Montesi" en la tabla.
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-amber-800 text-xs font-medium">
                👉 Haz clic en <strong className="font-bold inline-flex items-center gap-1 border border-amber-200 px-1 rounded bg-white"><Bot className="w-3 h-3" /> Evaluar con IA</strong> en su perfil.
              </p>
            </div>
          </>
        )}

        {step === 7 && (
          <>
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold">¡Score Generado!</span>
            </div>
            <p className="text-gray-600 text-sm">
              El sistema identificó que Javier tiene un presupuesto alto y lo marcó como Prioridad Alta al instante.
            </p>
            <p className="text-gray-600 text-sm font-medium mt-3 border-t pt-3">
              ¿Listo para usar esto en tu inmobiliaria de forma automatizada?
            </p>
            <button
              onClick={() => router.push("/sign-up")}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-[#2b88a1] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e5f73] transition-colors shadow-md"
            >
              Crear mi cuenta gratis
              <Sparkles className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <div className="mt-4 flex gap-1 justify-center relative z-10 w-full">
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden flex">
             <div className="bg-[#2b88a1] h-full transition-all duration-500 ease-out" style={{ width: `${(step / 7) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
