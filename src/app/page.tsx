import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { currentUser, homeFor } from "@/lib/session";
import { AUDIENCE_COOKIE } from "@/lib/i18n/server";
import { StudentsLanding } from "@/components/home/StudentsLanding";

export const metadata = {
  description: "Kadam. Take your first step. Solve real problems for small businesses and NGOs, and turn the results into an impact report for your resume.",
  alternates: { canonical: "/" },
};

// The home page is the student landing page (also served at /students).
// Signed-in users go straight to their dashboard; visitors who chose "business" before go to /businesses.
export default async function Home() {
  const u = await currentUser();
  if (u?.role) redirect(homeFor(u.role));
  if ((await cookies()).get(AUDIENCE_COOKIE)?.value === "business") redirect("/businesses");
  return <StudentsLanding />;
}
