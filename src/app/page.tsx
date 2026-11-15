import { getT } from "@/lib/i18n/server";
import { currentUser, homeFor } from "@/lib/session";
import { Welcome } from "./Welcome";

export default async function WelcomePage() {
  const t = await getT();
  const u = await currentUser();
  return (
    <Welcome
      home={u?.role ? homeFor(u.role) : null}
      text={{
        tagline: t("landing.tagline"),
        h1: t("welcome.h1"),
        h1accent: t("welcome.h1_accent"),
        sub: t("welcome.sub"),
        ask: t("welcome.ask"),
        studentTitle: t("welcome.student"),
        studentSub: t("welcome.student_sub"),
        businessTitle: t("welcome.business"),
        businessSub: t("welcome.business_sub"),
        login: t("landing.login"),
        open: t("welcome.continue"),
        note: t("landing.not_portal"),
      }}
    />
  );
}
