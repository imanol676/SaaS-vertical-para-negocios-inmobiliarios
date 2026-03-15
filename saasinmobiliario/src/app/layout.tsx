import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/src/lib/providers/QueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EstateOS - Potencia tu negocio inmobiliario con IA",
  description: "Plataforma de inteligencia inmobiliaria que transforma la gestión de leads en decisiones inteligentes. Prioriza prospectos, aumenta conversiones y optimiza el tiempo de tus agentes.",
  keywords: ["SaaS inmobiliario", "Inteligencia artificial inmobiliaria", "Gestión de leads real estate", "CRM Inmobiliario", "EstateOS"],
  openGraph: {
    title: "EstateOS - El Cerebro Operativo de tu Inmobiliaria",
    description: "Recibe, analiza y califica tus leads en segundos gracias a la Inteligencia Artificial. Multiplica tus resultados y optimiza el tiempo de cierre de tus agentes.",
    url: "https://estateos.com", // Esto se ajustará automáticamente dependiendo del dominio
    siteName: "EstateOS",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EstateOS - IA para Real Estate",
    description: "Prioriza tus leads inmobiliarios, optimiza tiempo y aumenta la conversión con IA.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
