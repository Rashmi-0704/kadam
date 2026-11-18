import "server-only";
import { redirect } from "next/navigation";
import { requireUser, businessProfile, studentProfile } from "./session";
import { q } from "./db";

export async function requireBusiness() {
  const user = await requireUser("business");
  const profile = await businessProfile(user.id);
  if (!profile) redirect("/business/onboarding");
  return { user, profile };
}

export async function requireStudent() {
  const user = await requireUser("student");
  let profile = await studentProfile(user.id);
  // Round 5: college, course and year may be empty; only the profile row itself must exist.
  if (!profile) {
    await q(`insert into student_profiles (user_id, verification_status) values ($1,'not_started') on conflict (user_id) do nothing`, [user.id]);
    profile = await studentProfile(user.id);
  }
  return { user, profile: profile! };
}
