"use client";
import { useActionState } from "react";
import { saveBusinessProfile, type FormState } from "@/app/actions/business";
import { SubmitButton } from "@/components/SubmitButton";
import { useT } from "@/lib/i18n/client";
import { BUSINESS_TYPES, SECTORS } from "@/db/taxonomy";

type Profile = { business_name?: string; type?: string; sector?: string; city?: string } | null;

export function BusinessProfileForm({ profile, next }: { profile: Profile; next?: "settings" }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(saveBusinessProfile, {});
  return (
    <form action={action} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label className="label" htmlFor="business_name">{t("bo.name")}</label>
        <input id="business_name" name="business_name" className="input" required defaultValue={profile?.business_name ?? ""} placeholder={t("bo.name_ph")} />
      </div>
      <div>
        <span className="label">{t("bo.type")}</span>
        <div className="grid grid-cols-2 gap-2">
          {BUSINESS_TYPES.map((b) => (
            <label key={b} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-line bg-card px-3 text-sm font-medium has-[:checked]:border-ink has-[:checked]:bg-mist">
              <input type="radio" name="type" value={b} defaultChecked={profile?.type === b} required className="h-4 w-4 accent-primary" />
              {t(`btype.${b}`)}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="sector">{t("bo.sector")}</label>
        <select id="sector" name="sector" className="input" required defaultValue={profile?.sector ?? ""}>
          <option value="" disabled>{t("bo.choose")}</option>
          {SECTORS.map((s) => <option key={s} value={s}>{t(`sector.${s}`)}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="city">{t("bo.city")}</label>
        <input id="city" name="city" className="input" required defaultValue={profile?.city ?? ""} placeholder={t("bo.city_ph")} />
      </div>
      {state.error && <p className="text-sm font-semibold text-alert" role="alert">{t(state.error)}</p>}
      <SubmitButton className="btn-primary w-full">{next ? t("common.save") : t("common.continue")}</SubmitButton>
    </form>
  );
}
