import { notFound, redirect } from "next/navigation";
import { requireStudent } from "@/lib/guards";
import { one } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { BackLink } from "@/components/ui";
import { StartForm } from "./StartForm";

// Reading a CV can take several seconds.
export const maxDuration = 60;

export const metadata = { title: "Before you start" };

/**
 * Take up is never locked. A student with no CV, or with college, course or year missing, lands here after pressing Take up:
 * one short page to fill in what they can, and one button that takes the problem up either way.
 */
export default async function StartProblem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, profile } = await requireStudent();
  const p = await one(`select p.id, p.title, p.status, b.business_name from problems p join business_profiles b on b.user_id = p.business_id where p.id = $1`, [id]);
  if (!p) notFound();
  const mine = await one(`select id from engagements where problem_id = $1 and student_id = $2 and status <> 'withdrawn'`, [id, user.id]);
  if (mine) redirect(`/student/engagements/${mine.id}`);
  if (p.status !== "live") redirect(`/student/problems/${id}`);
  const t = await getT();
  return (
    <div className="mx-auto max-w-xl">
      <BackLink href={`/student/problems/${id}`} label={t("common.back")} />
      <StartForm
        problemId={id}
        title={p.title}
        business={p.business_name}
        hasCv={Boolean(profile.cv_parsed)}
        details={{ college: profile.college ?? "", course: profile.course ?? "", year: profile.year ?? "" }}
      />
    </div>
  );
}
