import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type SessionClaims = {
  metadata?: { onboardingComplete?: boolean };
  publicMetadata?: { onboardingComplete?: boolean };
  onboardingComplete?: boolean;
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const hasCompletedOnboarding = Boolean(
    (sessionClaims as SessionClaims | null | undefined)?.metadata
      ?.onboardingComplete ??
    (sessionClaims as SessionClaims | null | undefined)?.publicMetadata
      ?.onboardingComplete ??
    (sessionClaims as SessionClaims | null | undefined)?.onboardingComplete,
  );

  if (hasCompletedOnboarding) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
