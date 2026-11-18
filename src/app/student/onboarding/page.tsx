import { redirect } from "next/navigation";

// Round 5: the separate onboarding screen is gone (sign-up is one page). Old links land on the profile.
export default function StudentOnboarding() {
  redirect("/student/profile");
}
