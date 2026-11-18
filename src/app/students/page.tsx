import { StudentsLanding } from "@/components/home/StudentsLanding";

// Same page as "/". The canonical link points search engines at "/".
export const metadata = {
  title: "For students",
  description: "Kadam. Take your first step. Solve real problems for small businesses and NGOs, and turn the results into an impact report for your resume.",
  alternates: { canonical: "/" },
};

export default function StudentsHome() {
  return <StudentsLanding />;
}
