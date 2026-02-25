import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  Shield,
  Headphones,
  Zap,
  Brain,
  LineChart,
  MessageSquare,
  Upload,
  Sparkles,
  XCircle,
  Check,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import { SignIn, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 ">
      {/*Header*/}

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">
            Estate<span className="text-2xl font-bold text-[#2b88a1]">OS</span>
          </div>
          <nav className="space-x-6">
            <a
              href="#caracteristicas"
              className="text-slate-700 hover:text-slate-900 transition-colors duration-300"
            >
              Características
            </a>
            <a
              href="#pricing"
              className="text-slate-700 hover:text-slate-900 transition-colors duration-300"
            >
              Precios
            </a>
            <a
              href="#contacto"
              className="text-slate-700 hover:text-slate-900 transition-colors duration-300"
            >
              Contacto
            </a>
          </nav>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#216477] text-white font-semibold text-sm hover:bg-[#2f869e] transition-all duration-300 shadow-lg hover:shadow-xl">
            <SignInButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 lg:px-8 pt-16 pb-20">
        {/* Main Hero Content */}
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-slate-900 text-slate-100 text-sm font-medium shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Plataforma de Inteligencia Inmobiliaria
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Potencia tu negocio
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#216477] to-[#2f869e] mt-2">
              inmobiliario con IA
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl lg:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            EstateOS transforma la gestión de leads en decisiones inteligentes.
            Enfócate en los clientes con mayor potencial de conversión y
            multiplica tus resultados.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-4 rounded-lg bg-[#216477] text-white font-semibold text-lg hover:bg-[#2f869e] transition-all duration-300 shadow-lg hover:shadow-xl">
              <SignUpButton />
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#216477] to-[#2f869e]">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">+85%</div>
              <div className="text-slate-600 font-medium">
                Conversión de Leads
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#216477] to-[#2f869e]">
                  <Target className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">-60%</div>
              <div className="text-slate-600 font-medium">
                Tiempo de Gestión
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#216477] to-[#2f869e]">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">3x</div>
              <div className="text-slate-600 font-medium">ROI Promedio</div>
            </div>
          </div>
        </div>
      </div>
      {/* Pain Section */}
      <div className="bg-gradient-to-b from-white to-slate-50 py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 mb-4 rounded-full bg-red-50 text-red-600 text-sm font-semibold">
                El Desafío
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                El problema no son los leads.
                <span className="block text-slate-600 mt-2">
                  Es no saber cuáles priorizar.
                </span>
              </h2>
            </div>

            {/* Pain Points */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-all hover:border-[#216477]/30">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    Llegan leads desde múltiples fuentes (web, redes sociales,
                    referidos), pero{" "}
                    <strong className="text-slate-900">
                      sin una forma clara de evaluar su calidad
                    </strong>{" "}
                    o potencial de conversión.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-all hover:border-[#216477]/30">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    No todos tienen intención real de compra o el presupuesto
                    adecuado, lo que dificulta la{" "}
                    <strong className="text-slate-900">
                      asignación eficiente de recursos y tiempo
                    </strong>{" "}
                    por parte de los agentes inmobiliarios.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-all hover:border-[#216477]/30">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    Se responde tarde a los mejores prospectos, lo que resulta
                    en
                    <strong className="text-slate-900">
                      {" "}
                      oportunidades perdidas
                    </strong>{" "}
                    y una menor tasa de cierre.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*Solution Section*/}
      <div
        id="caracteristicas"
        className="container mx-auto px-6 lg:px-8 py-20"
      >
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 mb-4 rounded-full bg-green-50 text-green-600 text-sm font-semibold">
              La Solución
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              Un cerebro operativo para tu inmobiliaria.
            </h2>
          </div>

          {/* Solution Points */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-all hover:border-[#216477]/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-slate-900 font-semibold text-lg mb-2">
                    Integración Instantánea
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    Recibe leads desde Google Sheets, Webhooks o carga manual y
                    deja que EstateOS los analice en segundos, asignando una
                    puntuación de calidad basada en datos históricos y
                    comportamiento.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-all hover:border-[#216477]/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-slate-900 font-semibold text-lg mb-2">
                    Análisis Inteligente
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    Normaliza los datos automáticamente, identificando patrones
                    clave como ubicación, presupuesto, tipo de propiedad e
                    intención de compra para predecir cuáles leads tienen mayor
                    probabilidad de convertirse en clientes.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-all hover:border-[#216477]/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-slate-900 font-semibold text-lg mb-2">
                    Score con IA
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    Genera un score con IA para cada lead, permitiendo a los
                    agentes inmobiliarios priorizar su tiempo en aquellos con
                    mayor potencial de conversión, aumentando así la eficiencia
                    y las tasas de cierre.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-all hover:border-[#216477]/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-slate-900 font-semibold text-lg mb-2">
                    Acción Optimizada
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    Te muestra a quién contactar primero, cuándo hacerlo y qué
                    decir para maximizar tus oportunidades de venta,
                    convirtiendo datos complejos en acciones simples y
                    efectivas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div
        id="pricing"
        className="bg-gradient-to-b from-slate-50 to-white py-20"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 mb-4 rounded-full bg-[#216477]/10 text-[#216477] text-sm font-semibold">
                Planes y Precios
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                Elige el plan perfecto para tu negocio
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Desde inmobiliarias independientes hasta grandes corporativos
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Starter
                  </h3>
                  <p className="text-slate-600">Para comenzar a optimizar</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-slate-900">
                      $99
                    </span>
                    <span className="text-slate-600 ml-2">/mes</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Hasta 500 leads/mes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">
                      Scoring con IA básico
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">
                      Integración Google Sheets
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Dashboard básico</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Soporte por email</span>
                  </li>
                </ul>
                <a
                  href="#"
                  className="block w-full text-center px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all"
                >
                  Comenzar ahora
                </a>
              </div>

              {/* Professional Plan - Featured */}
              <div className="bg-gradient-to-br from-[#216477] to-[#2f869e] rounded-2xl p-8 shadow-2xl border-4 border-[#216477] hover:shadow-3xl transition-all transform scale-105">
                <div className="inline-block px-3 py-1 mb-4 rounded-full bg-white/20 text-white text-xs font-bold">
                  MÁS POPULAR
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Professional
                  </h3>
                  <p className="text-white/90">Para crecer con inteligencia</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-white">$299</span>
                    <span className="text-white/80 ml-2">/mes</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-white">Hasta 2,500 leads/mes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-white">Scoring con IA avanzado</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-white">Todas las integraciones</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-white">
                      Dashboard avanzado + reportes
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-white">Webhooks y API</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-white">Soporte prioritario 24/7</span>
                  </li>
                </ul>
                <a
                  href="#"
                  className="block w-full text-center px-6 py-3 rounded-lg bg-white text-[#216477] font-semibold hover:bg-slate-50 transition-all shadow-lg"
                >
                  Comenzar ahora
                </a>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Enterprise
                  </h3>
                  <p className="text-slate-600">Solución personalizada</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-slate-900">
                      Custom
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Leads ilimitados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">IA personalizada</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Integraciones custom</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Equipo dedicado</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">SLA garantizado</span>
                  </li>
                </ul>
                <a
                  href="#contacto"
                  className="block w-full text-center px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all"
                >
                  Contactar ventas
                </a>
              </div>
            </div>

            {/* Trust Message */}
            <div className="text-center mt-12">
              <p className="text-slate-600">
                <Shield className="w-5 h-5 inline-block mr-2 text-emerald-500" />
                Todos los planes incluyen garantía de 14 días. Sin compromiso.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contacto" className="bg-white py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 mb-4 rounded-full bg-[#216477]/10 text-[#216477] text-sm font-semibold">
                Contacto
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                ¿Listo para transformar tu negocio?
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Nuestro equipo está listo para ayudarte a optimizar tu gestión
                de leads
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-slate-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                  Envíanos un mensaje
                </h3>
                <form className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-[#216477] focus:ring-2 focus:ring-[#216477]/20 outline-none transition-all"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Email corporativo
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-[#216477] focus:ring-2 focus:ring-[#216477]/20 outline-none transition-all"
                      placeholder="juan@inmobiliaria.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-[#216477] focus:ring-2 focus:ring-[#216477]/20 outline-none transition-all"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Empresa
                    </label>
                    <input
                      type="text"
                      id="company"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-[#216477] focus:ring-2 focus:ring-[#216477]/20 outline-none transition-all"
                      placeholder="Nombre de tu inmobiliaria"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-[#216477] focus:ring-2 focus:ring-[#216477]/20 outline-none transition-all resize-none"
                      placeholder="Cuéntanos sobre tu negocio y cómo podemos ayudarte..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-8 py-4 rounded-lg bg-[#216477] text-white font-semibold hover:bg-[#2f869e] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    Enviar mensaje
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">
                    Información de contacto
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#216477]/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-[#216477]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">
                          Email
                        </h4>
                        <a
                          href="mailto:hola@estateos.com"
                          className="text-slate-600 hover:text-[#216477] transition-colors"
                        >
                          hola@estateos.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#216477]/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-[#216477]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">
                          Teléfono
                        </h4>
                        <a
                          href="tel:+34900000000"
                          className="text-slate-600 hover:text-[#216477] transition-colors"
                        >
                          +34 900 000 000
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#216477]/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-[#216477]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">
                          Oficina
                        </h4>
                        <p className="text-slate-600">
                          Calle Principal 123
                          <br />
                          28001 Madrid, España
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="bg-gradient-to-br from-[#216477] to-[#2f869e] rounded-2xl p-8 text-white">
                  <h4 className="font-bold text-lg mb-4">
                    Horario de atención
                  </h4>
                  <div className="space-y-2 text-white/90">
                    <p className="flex justify-between">
                      <span>Lunes - Viernes:</span>
                      <span className="font-semibold">9:00 - 18:00</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Sábados:</span>
                      <span className="font-semibold">Cerrado</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Domingos:</span>
                      <span className="font-semibold">10:00 - 14:00</span>
                    </p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-sm">
                      <Clock className="w-4 h-4 inline-block mr-2" />
                      Soporte 24/7 disponible para clientes Enterprise
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">
                Estate<span className="text-[#2f869e]">OS</span>
              </div>
              <p className="text-sm text-slate-400">
                Potencia tu negocio inmobiliario con inteligencia artificial.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Características
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integraciones
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sobre nosotros
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Términos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>© 2026 EstateOS. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
