import { QueryClient } from "@tanstack/react-query";

// Configuración del QueryClient con opciones predeterminadas
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo en que los datos se consideran "frescos"
      staleTime: 1000 * 60 * 5, // 5 minutos

      // Tiempo que los datos se mantienen en caché
      gcTime: 1000 * 60 * 30, // 30 minutos (antes era cacheTime)

      // Reintentar automáticamente en caso de error
      retry: 1,

      // Refetch cuando la ventana gana foco
      refetchOnWindowFocus: false,

      // Refetch cuando se reconecta
      refetchOnReconnect: true,

      // Refetch al montar el componente
      refetchOnMount: true,
    },
    mutations: {
      // Opciones para mutations
      retry: 0,
    },
  },
});

// Función para crear un nuevo QueryClient (útil para testing o SSR)
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
