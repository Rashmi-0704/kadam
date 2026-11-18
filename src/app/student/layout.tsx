import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/session";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("student");
  return (
    <AppShell user={user}>
      {children}
    </AppShell>
  );
}
