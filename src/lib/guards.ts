import "server-only";
import { redirect } from "next/navigation";
import { requireUser, businessProfile, studentProfile } from "./session";

export async function requireBusiness() {
  const user = await requireUser("business");
  const profile = await businessProfile(user.id);
  if (!profile) redirect("/business/onboarding");
  return { user, profile };
}

export async function requireStudent() {
  const user = await requireUser("student");
  const profile = await studentProfile(user.id);
  if (!profile || !profile.college) redirect("/student/onboarding");
  return { user, profile };
}
