import { notFound } from "next/navigation";
import { requireBusiness } from "@/lib/guards";
import { one } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { ReviewForm } from "./ReviewForm";
import { StepRail } from "@/components/StepRail";
import { BackLink } from "@/components/ui";

// AI calls can take several seconds.
export const maxDuration = 60;

export const metadata = { title: "Review problem" };

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireBusiness();
  const p = await one(`select * from problems where id = $1 and business_id = $2`, [id, user.id]);
  if (!p) notFound();
  const t = await getT();
  return (
    <div className="mx-auto max-w-2xl">
      {p.status === "draft" ? (
        <StepRail steps={[t("pc.rail1"), t("pc.rail2"), t("pc.rail3")]} current={2} />
      ) : (
        <BackLink href={`/business/problems/${id}`} label={t("common.back")} />
      )}
      <h1 className="mt-5 text-2xl font-bold sm:text-3xl">{p.status === "draft" ? t("review.title") : t("review.edit_title")}</h1>
      <p className="mt-1 mb-6 text-ink-2">{t("review.sub")}</p>
      <ReviewForm p={JSON.parse(JSON.stringify(p))} />
    </div>
  );
}
