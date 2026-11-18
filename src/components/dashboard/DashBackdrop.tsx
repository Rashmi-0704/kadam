import { HeroWords } from "@/components/motion/HeroWords";
import { RoleTrail } from "@/components/motion/RoleTrail";

// Everything that is dashboard content blocks the trail; only the empty canvas between and around it doesn't.
const BLOCK = "header, nav, .card, .glow-card, a, button, h1, h2, h3, p, ol, [data-trail-block]";

/**
 * The homepage hero's moving word rows and role trail, as a fixed background behind a dashboard.
 * Sits under the page content (wrap the content in `relative z-10`), never takes clicks, decorative only.
 */
export function DashBackdrop({ words }: { words: [string, string, string, string] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <HeroWords phrases={words} />
      <RoleTrail page blockSelector={BLOCK} />
    </div>
  );
}
