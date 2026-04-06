"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDemo } from "@/src/lib/demo/DemoContext";
import { ArrowRight, Sparkles, X, CheckCircle2 } from "lucide-react";

export function TourGuide() {
  const pathname = usePathname();
  const router = useRouter();
  const { leads } = useDemo();
  
  const [step, setStep] = useState(1);
  const [isOpen, setIsOpen] = useState(true);

  // Auto-advance step based on pathname and context state
  useEffect(() => {
    if (pathname === "/demo/leads") {
      // Si estamos en la página de leads
      // verificar si el primer lead ya tiene score
      const lead1 = leads.find((l) => l.id === "lead-1");
      if (lead1 && lead1.latest_score) {
        setStep(3); // Ya lo calificó!
      } else {
        setStep(2); // Está en leads listo para calificar
      }
    } else if (pathname === "/demo") {
      setStep(1); // Inicio
    }
  }, [pathname, leads]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm rounded-xl border border-[#2b88a1]/20 bg-white p-5 shadow-2xl overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#2b88a1]/10 to-transparent -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />

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
              Aquí ves un resumen inteligente de tu negocio. El sistema prioriza automáticamente la atención.
            </p>
            <p className="text-gray-600 text-sm">
              Vamos a la pestaña de Leads para ver la Inteligencia Artificial en acción.
            </p>
            <button
              onClick={() => router.push("/demo/leads")}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-[#2b88a1] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e5f73] transition-colors"
            >
              Ver mis Leads
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-gray-600 text-sm">
              <strong className="text-gray-900 block mb-1">Tus Prospectos</strong>
              Mira el lead de <span className="font-semibold text-gray-800">María Gómez</span>. Acaba de ingresar y no sabemos qué tan importante es.
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-amber-800 text-xs font-medium">
                👉 Haz clic en el botón <strong className="font-bold">"Evaluar con IA"</strong> en la fila de María Gómez en la tabla.
              </p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold">¡Score Generado!</span>
            </div>
            <p className="text-gray-600 text-sm">
              La IA ha determinado su prioridad al instante basado en sus parámetros (budget, zona, etc).
            </p>
            <p className="text-gray-600 text-sm">
              Estás listo para llevar tu inmobiliaria al siguiente nivel. ¿Creamos tu cuenta real?
            </p>
            <button
              onClick={() => router.push("/sign-up")}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-[#2b88a1] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e5f73] transition-colors"
            >
              Crear mi cuenta gratis
              <Sparkles className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <div className="mt-4 flex gap-1 justify-center relative z-10">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all ${step === i ? 'w-4 bg-[#2b88a1]' : 'w-1.5 bg-gray-200'}`} 
          />
        ))}
      </div>
    </div>
  );
}
