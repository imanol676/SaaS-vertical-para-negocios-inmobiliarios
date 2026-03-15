import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Zap, Shield } from 'lucide-react';

export default function SobreNosotros() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-[#216477] hover:text-[#2f869e] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Sobre EstateOS</h1>
          <p className="text-xl text-slate-600">
            Transformando la manera en que los agentes inmobiliarios gestionan y cierran ventas.
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">Nuestra Misión</h2>
            <p>
              En EstateOS, creemos que el tiempo de un agente inmobiliario es su activo más valioso. 
              Nuestra misión es democratizar el acceso a la Inteligencia Artificial para el sector Real Estate, 
              permitiendo a las agencias de todos los tamaños competir al más alto nivel identificando 
              en milisegundos a sus prospectos más calificados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-12">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
              <div className="w-12 h-12 bg-[#216477]/10 text-[#216477] rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Innovación Constante</h3>
              <p className="text-sm">Aplicamos los últimos modelos de IA para mantener tu negocio a la vanguardia.</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
              <div className="w-12 h-12 bg-[#216477]/10 text-[#216477] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Enfoque Humano</h3>
              <p className="text-sm">La IA no reemplaza al agente, potencia su capacidad de cerrar tratos conectándolo con la persona correcta.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
              <div className="w-12 h-12 bg-[#216477]/10 text-[#216477] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Privacidad y Seguridad</h3>
              <p className="text-sm">Tus datos y los de tus prospectos son tratados bajo los más estrictos estándares de la industria.</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">El Problema que Resolvemos</h2>
            <p>
              El mercado inmobiliario actual sufre de un exceso de información (leads "basura" o descalificados) 
              combinado con una escasez de atención. Los agentes pierden incontables horas llamando a contactos 
              sin intención o presupuesto, frustrando su productividad.
            </p>
            <p className="mt-4">
              EstateOS no es un CRM más, es un "Cerebro Operativo" que se sienta encima de tus datos actuales 
              (ya sea que uses Google Sheets o los cargues a mano) para decirte exactamente a quién debes llamar hoy para cerrar una venta mañana.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
