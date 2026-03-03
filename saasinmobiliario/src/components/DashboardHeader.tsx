"use client";

import { UserButton } from "@clerk/nextjs";

export default function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold text-slate-900">
          Estate<span className="text-2xl font-bold text-[#2b88a1]">OS</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
