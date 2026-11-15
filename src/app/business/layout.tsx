import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/session";

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("business");
  return <AppShell user={user}>{children}</AppShell>;
}
