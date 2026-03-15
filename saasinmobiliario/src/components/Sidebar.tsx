"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navItems = [
  { label: "Home", href: "/dashboard" },
  { label: "Propiedades", href: "/dashboard/propiedades" },
  { label: "Fuentes de Leads", href: "/dashboard/fuentes-leads" },
  { label: "Leads", href: "/dashboard/leads" },
  { label: "Usuarios", href: "/dashboard/usuarios" },
  { label: "Organización", href: "/dashboard/organizacion" },
  { label: "Prompt", href: "/dashboard/prompt" },
  { label: "Historial de Scoring", href: "/dashboard/historial-scoring" },
  { label: "Facturación", href: "/dashboard/billing" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="group hidden md:block min-h-full w-20 shrink-0 self-stretch overflow-hidden border-r border-gray-200 bg-white transition-all duration-300 hover:w-64">
      <div className="px-5 py-6">
        <h2 className="whitespace-nowrap text-lg font-semibold text-[#2b88a1] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Menú
        </h2>
      </div>

      <nav className="px-3 pb-6" aria-label="Navegación principal">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const shortLabel = item.label
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-linear-to-r from-[#2b88a1] to-[#1e5f73] text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:border-[#1e5f73]"
                  }`}
                >
                  <span
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {shortLabel}
                  </span>
                  <span className="max-w-0 opacity-0 transition-all duration-200 group-hover:max-w-45 group-hover:opacity-100">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
