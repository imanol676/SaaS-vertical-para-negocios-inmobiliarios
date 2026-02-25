"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { makeQueryClient } from "../queryClient";

// Provider para TanStack Query
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Crear una instancia del QueryClient que persiste durante la vida del componente
  // Esto evita que se cree un nuevo cliente en cada render
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
