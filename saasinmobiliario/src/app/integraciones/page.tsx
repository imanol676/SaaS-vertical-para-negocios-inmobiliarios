import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';

export default function Integraciones() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 lg:px-8 flex flex-col items-center justify-center text-center">
      <div className="inline-block p-4 rounded-full bg-emerald-100 text-emerald-600 mb-6">
        <Clock className="w-12 h-12" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Próximamente</h1>
      
      <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
        Estamos trabajando arduamente para integrar <strong>EstateOS</strong> con tus herramientas y CRMs inmobiliarios favoritos.
        Muy pronto podrás conectar directamente con Tokko Broker, Sumaprop, Tokkobroker y más, sumado a nuestra actual integración oficial con <strong>Google Sheets</strong>.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link href="/" className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-[#216477] text-white font-semibold hover:bg-[#2f869e] transition-all shadow-lg hover:shadow-xl">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
