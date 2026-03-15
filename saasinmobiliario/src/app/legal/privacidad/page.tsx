import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-[#216477] hover:text-[#2f869e] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Política de Privacidad</h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>Última actualización: {new Date().toLocaleDateString('es-AR')}</p>
          
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Información que recopilamos</h2>
          <p>
            En EstateOS, recopilamos información para brindar mejores servicios a todos nuestros usuarios.
            Esta información incluye datos proporcionados directamente por usted (como nombre, correo electrónico, y datos de facturación) 
            y datos recopilados automáticamente (como los leads integrados a través de Google Sheets o cargas manuales).
          </p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. Uso de la Inteligencia Artificial</h2>
          <p>
            EstateOS utiliza la información de los prospectos (leads) cargados exclusivamente para proveer
            nuestro servicio de scoring y priorización utilizando Inteligencia Artificial. Sus datos no
            serán vendidos ni compartidos con terceros con fines publicitarios.
          </p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. Seguridad de los datos</h2>
          <p>
            Estamos comprometidos a mantener su información de forma segura. Contamos con
            procedimientos físicos, electrónicos y administrativos apropiados para salvaguardar
            y asegurar la información que recopilamos en línea.
          </p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. Retención de información</h2>
          <p>
            Retendremos su información personal por el tiempo necesario para cumplir
            con los propósitos delineados en esta Política de Privacidad, a menos
            que un período de retención más largo sea requerido o permitido por la ley.
          </p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">5. Contacto</h2>
          <p>
            Si tiene alguna pregunta sobre esta Política de Privacidad, no dude en contactarnos a través de nuestro correo electrónico: <a href="mailto:estateos40@gmail.com" className="text-[#216477] hover:underline">estateos40@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
