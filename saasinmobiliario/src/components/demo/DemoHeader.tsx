"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import Logo from "@/src/components/Logo";

export function DemoHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="bg-[#2b88a1] px-4 py-2 text-center text-sm font-medium text-white shadow-sm flex items-center justify-between">
        <span>Estás en Modo Demo Interactiva. Los datos mostrados no son reales.</span>
        <Link href="/sign-up" className="bg-white text-[#2b88a1] px-3 py-1 rounded-md text-xs font-bold hover:bg-slate-100 transition">
          Crear cuenta real
        </Link>
      </div>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-1 -ml-2 text-slate-600 hover:text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center">
            <Logo className="h-10 w-auto" />
            <span className="text-sm font-semibold text-gray-400 align-middle ml-2 mt-1">DEMO</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition underline">
            Salir de la Demo
          </Link>
        </div>
      </header>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[110px] left-0 w-full z-40 border-b border-slate-100 bg-white px-6 py-4 shadow-lg overflow-y-auto max-h-[calc(100vh-110px)]">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/demo"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-md px-3 py-3 text-base font-medium transition-colors text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              Home
            </Link>
            <Link
              href="/demo/leads"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-md px-3 py-3 text-base font-medium transition-colors text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              Leads
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
