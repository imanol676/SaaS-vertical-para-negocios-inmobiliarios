"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Propiedades", href: "/dashboard/propiedades" },
  { label: "Leads", href: "/dashboard/leads" },
  { label: "Fuentes de Leads", href: "/dashboard/fuentes-leads" },
  { label: "Usuarios", href: "/dashboard/usuarios" },
  { label: "Organización", href: "/dashboard/organizacion" },
  { label: "Historial de Scoring", href: "/dashboard/historial-scoring" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen border-r border-gray-200 bg-white">
      <div className="px-5 py-6">
        <h2 className="text-lg font-semibold text-[#2b88a1]">Menú</h2>
      </div>

      <nav className="px-3 pb-6" aria-label="Navegación principal">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.label === item.label && pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-[#2b88a1] to-[#1e5f73] text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:border-[#1e5f73]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
