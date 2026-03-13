import { MercadoPagoConfig, PreApproval, Payment } from "mercadopago";

const accessToken = process.env.MP_ACCESS_TOKEN;

if (!accessToken) {
  throw new Error("MP_ACCESS_TOKEN no está configurado");
}

const explicitMode = (process.env.MP_ENVIRONMENT ?? "").toLowerCase();

export const isMercadoPagoTestMode =
  explicitMode === "test" ||
  explicitMode === "sandbox" ||
  accessToken.startsWith("TEST-");

const client = new MercadoPagoConfig({
  accessToken,
});

export function getCheckoutUrlFromPreapproval(preapproval: unknown) {
  const data = preapproval as Record<string, unknown>;
  const sandboxInitPoint =
    typeof data.sandbox_init_point === "string"
      ? data.sandbox_init_point
      : null;
  const initPoint =
    typeof data.init_point === "string" ? data.init_point : null;

  if (isMercadoPagoTestMode) {
    return sandboxInitPoint ?? initPoint;
  }

  return initPoint ?? sandboxInitPoint;
}

export const mpPreApproval = new PreApproval(client);
export const mpPayment = new Payment(client);
export { client as mpClient };
