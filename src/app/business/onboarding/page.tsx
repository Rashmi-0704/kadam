import { requireUser, businessProfile } from "@/lib/session";
import { getT } from "@/lib/i18n/server";
import { BusinessProfileForm } from "./BusinessProfileForm";

export const metadata = { title: "Your business" };

export default async function BusinessOnboarding() {
  const user = await requireUser("business");
  const profile = await businessProfile(user.id);
  const t = await getT();
  return (
    <div className="mx-auto max-w-lg">
      <p className="eyebrow">{t("bo.eyebrow")}</p>
      <h1 className="mt-1 text-3xl font-bold">{t("bo.title", { name: user.name?.split(" ")[0] ?? "" })}</h1>
      <p className="mt-2 mb-6 text-ink-2">{t("bo.sub")}</p>
      <div className="card p-5 sm:p-6">
        <BusinessProfileForm profile={profile} />
      </div>
    </div>
  );
}
