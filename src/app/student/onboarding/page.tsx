import { requireUser, studentProfile } from "@/lib/session";
import { one } from "@/lib/db";
import { safeNext } from "@/lib/safe-next";
import { IdOnboarding } from "./IdOnboarding";

export const metadata = { title: "Add your student ID" };

// Round 4: one card, one action at a time. Upload the student ID → we read college, course and year → Continue.
export default async function StudentOnboarding({ searchParams }: { searchParams: Promise<{ next?: string; intent?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser("student");
  const profile = await studentProfile(user.id);
  const next = safeNext(sp.next);
  const intent = sp.intent === "takeup" && next ? "takeup" : "";
  const problemId = intent ? next?.match(/^\/student\/problems\/([0-9a-f-]{36})$/)?.[1] : undefined;
  const problem = problemId ? await one(`select title from problems where id = $1`, [problemId]) : null;
  const status = profile?.verification_status ?? "not_started";
  const lastReq = status === "rejected" ? await one(`select note from verification_requests where student_id = $1 order by submitted_at desc limit 1`, [user.id]) : null;
  const hasId = status === "verified" || status === "pending";
  return (
    <div className="mx-auto max-w-lg">
      <IdOnboarding
        next={next ?? ""}
        intent={intent}
        problemTitle={problem?.title ?? null}
        rejectedNote={status === "rejected" ? String(lastReq?.note ?? "") || "The photo wasn't a clear student ID." : null}
        initial={hasId ? { college: profile?.college ?? "", course: profile?.course ?? "", year: profile?.year ?? "" } : null}
      />
    </div>
  );
}
