import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type SessionClaims = {
  metadata?: { onboardingComplete?: boolean; role?: string };
  publicMetadata?: { onboardingComplete?: boolean; role?: string };
  onboardingComplete?: boolean;
  role?: string;
};

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isLandingRoute = createRouteMatcher(["/"]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)", // Todas las rutas API son públicas
]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAgentRoute = createRouteMatcher(["/agent(.*)"]);

const isOnboardingComplete = (
  sessionClaims: SessionClaims | null | undefined,
) =>
  Boolean(
    sessionClaims?.metadata?.onboardingComplete ??
    sessionClaims?.publicMetadata?.onboardingComplete ??
    sessionClaims?.onboardingComplete,
  );

const getUserRole = (sessionClaims: SessionClaims | null | undefined): string =>
  sessionClaims?.metadata?.role ??
  sessionClaims?.publicMetadata?.role ??
  sessionClaims?.role ??
  "admin";

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { isAuthenticated, sessionClaims, redirectToSignIn } = await auth();
  const hasCompletedOnboarding = isOnboardingComplete(
    sessionClaims as SessionClaims,
  );
  const role = getUserRole(sessionClaims as SessionClaims);

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

  // Si el usuario autenticado entra a la landing, enviarlo según su estado de onboarding y rol
  if (isAuthenticated && isLandingRoute(req)) {
    if (!hasCompletedOnboarding) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    const home = role === "agent" ? "/agent" : "/dashboard";
    return NextResponse.redirect(new URL(home, req.url));
  }

  // Redirigir usuarios que no completaron onboarding
  if (isAuthenticated && !hasCompletedOnboarding && !isOnboardingRoute(req)) {
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // Proteger rutas por rol: agentes no acceden a /dashboard
  if (
    isAuthenticated &&
    hasCompletedOnboarding &&
    isDashboardRoute(req) &&
    role === "agent"
  ) {
    return NextResponse.redirect(new URL("/agent", req.url));
  }

  // Proteger rutas por rol: admins que entren a /agent van a /dashboard
  if (
    isAuthenticated &&
    hasCompletedOnboarding &&
    isAgentRoute(req) &&
    role !== "agent"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
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
