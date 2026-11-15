import { Logo } from "@/components/Logo";
import { LinkSignIn } from "./LinkSignIn";

export const metadata = { title: "Signing you in" };

export default function AuthCallback() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <LinkSignIn />
    </main>
  );
}
