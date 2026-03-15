import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function Blog() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 lg:px-8 flex flex-col items-center justify-center text-center">
      <div className="inline-block p-4 rounded-full bg-[#216477]/10 text-[#216477] mb-6">
        <BookOpen className="w-12 h-12" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Blog de EstateOS</h1>
      
      <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
        Estamos preparando contenido de altísimo valor. Entrevistas a los *top producers* del Real Estate, estrategias de captación, 
        casos de éxito de Inteligencia Artificial aplicada a la venta inmobiliaria y mucho más.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link href="/" className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
