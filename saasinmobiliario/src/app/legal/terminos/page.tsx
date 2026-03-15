import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Terminos() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-[#216477] hover:text-[#2f869e] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Términos de Servicio</h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>Última actualización: {new Date().toLocaleDateString('es-AR')}</p>
          
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar EstateOS, usted acepta estar sujeto a estos Términos de Servicio y a
            todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, 
            tiene prohibido el uso o acceso a este sitio o al software asociado.
          </p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. Licencia de Uso</h2>
          <p>
            Se otorga permiso para utilizar temporalmente el software de EstateOS
            (SaaS Inmobiliario) exclusivamente para el procesamiento y scoring de prospectos de su propia 
            organización o inmobiliaria. Esta es la concesión de una licencia, no una transferencia
            de título.
          </p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. Limitaciones</h2>
          <p>
            En ningún caso EstateOS o sus proveedores serán responsables de ningún daño
            (incluyendo, sin limitación, daños por pérdida de datos o beneficios, o
            debido a la interrupción del negocio) que surjan del uso o la imposibilidad
            de usar los materiales en el sitio web de EstateOS.
          </p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. Facturación y Suscripciones</h2>
          <p>
            Los pagos por el servicio se manejan a través de Mercado Pago y son cobrados mes a mes de forma recurrente. 
            El cliente puede cancelar su suscripción en cualquier momento desde el área de facturación del Dashboard. 
            Al exceder los límites del plan contratado (leads, propiedades, scorings de IA), el uso de la plataforma será restringido 
            hasta que inicie el nuevo ciclo de facturación o mejore de plan.
          </p>
        </div>
      </div>
    </div>
  );
}
