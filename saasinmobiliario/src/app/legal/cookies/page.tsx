import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Cookies() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-[#216477] hover:text-[#2f869e] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Política de Cookies</h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>Última actualización: {new Date().toLocaleDateString('es-AR')}</p>
          
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. ¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que los sitios web que visita guardan en su 
            computadora o dispositivo móvil. Se utilizan ampliamente para que los sitios web funcionen 
            de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
          </p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. ¿Cómo usamos las cookies?</h2>
          <p>
            En EstateOS utilizamos cookies principalmente para:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Mantener su sesión activa (autenticación a través de Clerk).</li>
            <li>Recordar sus preferencias de interfaz en el Dashboard.</li>
            <li>Recopilar estadísticas anónimas sobre cómo los usuarios interactúan con nuestra plataforma para mejorar la UX.</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. Tipos de cookies que utilizamos</h2>
          <p>
            <strong>Cookies Esenciales:</strong> Estas cookies son estrictamente necesarias para proporcionarle 
            servicios disponibles a través de nuestro sitio web y para usar algunas de sus funciones, 
            como iniciar sesión en áreas seguras (Clerk authentication cookies).
          </p>
          <p>
            <strong>Cookies de Rendimiento:</strong> Estas cookies recopilan información sobre cómo interactúa con nuestro sitio, 
            por ejemplo, qué páginas visita con más frecuencia. Estos datos nos ayudan a optimizar el sitio web.
          </p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. Gestión de Cookies</h2>
          <p>
            Puede configurar su navegador para que rechace todas o algunas de las cookies del navegador, 
            o para que le avise cuando los sitios web configuren o accedan a las cookies. Tenga en cuenta 
            que si desactiva o rechaza las cookies esenciales, algunas partes del panel de control (Dashboard) de EstateOS 
            pueden volverse inaccesibles o no funcionar correctamente.
          </p>
        </div>
      </div>
    </div>
  );
}
