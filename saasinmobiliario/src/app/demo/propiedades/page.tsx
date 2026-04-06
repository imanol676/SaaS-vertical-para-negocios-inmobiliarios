"use client";

import { useDemo } from "@/src/lib/demo/DemoContext";
import { Plus, Home as HomeIcon, MapPin } from "lucide-react";

export default function DemoProperties() {
  const { properties } = useDemo();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2b88a1]">
            Inventario de Propiedades
          </h1>
          <p className="text-gray-600 mt-1">
            Revisa tus propiedades activas (Demo Local).
          </p>
        </div>
        <button 
           className="bg-[#2b88a1] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1e5f73] transition-colors flex items-center gap-2 shadow-sm"
           onClick={() => alert("En la app real, aquí abriría un formulario para cargar una nueva propiedad o conectarse a tu CRM/Zonaprop.")}
        >
           <Plus className="w-4 h-4" />
           Nueva Propiedad
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {properties.map((prop) => (
             <div key={prop.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:border-[#2b88a1]/30 hover:shadow-md transition-all">
                <div className="h-40 bg-gray-100 flex items-center justify-center border-b border-gray-100 relative">
                    <HomeIcon className="w-12 h-12 text-gray-300" />
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wide shadow-sm">
                       Disponible
                    </span>
                </div>
                <div className="p-5">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 group-hover:text-[#2b88a1] transition-colors">{prop.title}</h3>
                   </div>
                   <div className="flex items-center text-gray-500 text-sm mb-4">
                      <MapPin className="w-4 h-4 mr-1 opacity-70" />
                      {prop.location}
                   </div>
                   
                   <div className="flex items-baseline justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500 font-medium">{prop.type}</span>
                      <span className="text-lg font-black text-gray-900">
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      }).format(prop.price)}
                      </span>
                   </div>
                </div>
             </div>
         ))}
      </div>
    </div>
  );
}
