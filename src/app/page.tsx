import { getT } from "@/lib/i18n/server";
import { currentUser, homeFor } from "@/lib/session";
import { Welcome } from "./Welcome";

// First screen: two big cards — student or business — and nothing else competing with them.
export default async function WelcomePage() {
  const t = await getT();
  const u = await currentUser();
  return (
    <Welcome
      home={u?.role ? homeFor(u.role) : null}
      text={{
        tagline: t("landing.tagline"),
        home: t("nav.home"),
        who: t("auth.who_title"),
        whoSub: t("welcome.who_sub"),
        studentTitle: t("welcome.student"),
        studentSub: t("welcome.student_sub"),
        studentGo: t("welcome.go_student"),
        businessTitle: t("welcome.business"),
        businessSub: t("welcome.business_sub"),
        businessGo: t("welcome.go_business"),
        login: t("landing.login"),
        open: t("welcome.continue"),
        note: t("landing.not_portal"),
      }}
    />
  );
}
