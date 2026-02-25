import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type SessionClaims = {
  metadata?: { onboardingComplete?: boolean };
  publicMetadata?: { onboardingComplete?: boolean };
  onboardingComplete?: boolean;
};

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isLandingRoute = createRouteMatcher(["/"]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)", // Todas las rutas API son públicas
]);

const isOnboardingComplete = (
  sessionClaims: SessionClaims | null | undefined,
) =>
  Boolean(
    sessionClaims?.metadata?.onboardingComplete ??
    sessionClaims?.publicMetadata?.onboardingComplete ??
    sessionClaims?.onboardingComplete,
  );

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { isAuthenticated, sessionClaims, redirectToSignIn } = await auth();
  const hasCompletedOnboarding = isOnboardingComplete(
    sessionClaims as SessionClaims,
  );

  // Las rutas API siempre son accesibles
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Para usuarios visitando /onboarding, no redirigir
  if (isAuthenticated && isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  // Si el usuario no está autenticado y la ruta es privada, redirigir a sign-in
  if (!isAuthenticated && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Si el usuario autenticado entra a la landing, enviarlo según su estado de onboarding
  if (isAuthenticated && isLandingRoute(req)) {
    const redirectUrl = new URL(
      hasCompletedOnboarding ? "/dashboard" : "/onboarding",
      req.url,
    );

    return NextResponse.redirect(redirectUrl);
  }

  // Redirigir usuarios que no completaron onboarding
  if (isAuthenticated && !hasCompletedOnboarding && !isOnboardingRoute(req)) {
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // Si el usuario está autenticado, permitir acceso
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
