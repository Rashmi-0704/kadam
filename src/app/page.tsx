import { redirect } from "next/navigation";
import { currentUser, homeFor } from "@/lib/session";
import { StudentsLanding } from "@/components/home/StudentsLanding";

export const metadata = {
  description: "Kadam. Take your first step. Solve real problems for small businesses and NGOs, and turn the results into an impact report for your resume.",
  alternates: { canonical: "/" },
};

// The home page is the student landing page (also served at /students).
// Always the student page for visitors (never /businesses, whatever was picked before); signed-in users go to their dashboard.
export default async function Home() {
  const u = await currentUser();
  if (u?.role) redirect(homeFor(u.role));
  return <StudentsLanding />;
}
