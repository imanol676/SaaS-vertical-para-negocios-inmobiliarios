import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const billingKeys = {
  status: ["billing", "status"] as const,
};

interface SubscriptionStatus {
  status: "none" | "pending" | "authorized" | "paused" | "cancelled";
  plan: string | null;
  nextPaymentDate: string | null;
}

interface CreateSubscriptionResponse {
  subscription: { id: string; plan: string; status: string };
  checkoutUrl: string;
}

/**
 * Hook para obtener el estado de suscripción
 */
export function useBillingStatus() {
  return useQuery({
    queryKey: billingKeys.status,
    queryFn: async () => {
      const response = await fetch("/api/billing/status");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al obtener estado de billing");
      }
      return response.json() as Promise<SubscriptionStatus>;
    },
  });
}

/**
 * Hook para crear suscripción (redirige a checkout de MP)
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: string) => {
      const response = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear suscripción");
      }

      return response.json() as Promise<CreateSubscriptionResponse>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.status });
      // Redirigir al checkout de Mercado Pago
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
  });
}

/**
 * Hook para cancelar suscripción
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al cancelar suscripción");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.status });
    },
  });
}
