import { VerificationBanner } from "./VerificationBanner";
import { AppShell } from "@/components/AppShell";
import { requireUser, studentProfile } from "@/lib/session";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("student");
  const profile = await studentProfile(user.id);
  const status = profile?.verification_status ?? "not_started";
  return (
    <AppShell user={user}>
      {profile?.college && (status === "not_started" || status === "rejected") && <VerificationBanner rejected={status === "rejected"} />}
      {children}
    </AppShell>
  );
}
