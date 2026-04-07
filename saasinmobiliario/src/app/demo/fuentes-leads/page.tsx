"use client";

import { useDemo } from "@/src/lib/demo/DemoContext";
import { Download, CheckCircle2 } from "lucide-react";

export default function DemoFuentesLeads() {
  const { importLeads, isImporting, hasImportedLeads } = useDemo();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2b88a1]">
          Fuentes de Leads
        </h1>
        <p className="mt-2 text-gray-600">
          Enlaza tus plataformas externas para importar leads automáticamente a EstateOS (Modo Demo).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl mb-4 w-16 h-16 flex items-center justify-center border border-emerald-100">
             <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg" alt="Google Sheets" className="w-8 h-8 opacity-80 mix-blend-multiply" />
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">Google Sheets</h3>
          <p className="text-sm text-gray-500 mb-6 px-4">
            Importa tus registros directamente desde una hoja de cálculo.
          </p>

          <button
            onClick={importLeads}
            disabled={isImporting || hasImportedLeads}
            className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition-all ${
               hasImportedLeads
                 ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
                 : "bg-[#2b88a1] text-white hover:bg-[#1e5f73] shadow-md"
            }`}
          >
             {isImporting ? (
                 <>
                   <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                   Sincronizando...
                 </>
             ) : hasImportedLeads ? (
                 <>
                   <CheckCircle2 className="w-4 h-4" /> Sincronizado Correctamente
                 </>
             ) : (
                 <>
                   <Download className="w-4 h-4" /> Sincronizar Ahora
                 </>
             )}
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center opacity-70">
           <h3 className="font-bold text-gray-500 mb-2">+ Más Fuentes</h3>
           <p className="text-sm text-gray-400">
             En la aplicación real, podrás conectar Zonaprop, Meta Ads, Tokko Broker, y más.
           </p>
        </div>
      </div>
    </div>
  );
}
