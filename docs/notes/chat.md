# Chat animations (section 9)
- Shared keyframes + reduced-motion hook + `tr()` (t() with English fallback until keys merged) in src/components/chat/motion.tsx. Transform/opacity only; reduced motion = fade only, no typewriter.
- AiChatPanel: wrapped action (catches thrown errors -> friendly retry bubble, rethrows NEXT_* redirects), optimistic user bubble, typing dots + pulsing avatar, word-by-word typing for the newest AI turn that arrived after mount, quick-reply chips only if `state.suggestions` is returned (no action returns it yet), `aiBusy` note, send disabled while pending.
- ChatThread: slide-in for messages that appear after first load, optimistic "Sending…"/"Sent" bubble, own bubble now bg-primary.
- New i18n keys in docs/notes/i18n-chat.json (chat.error_friendly, chat.ai_busy, chat.quick_replies, chat.sending, chat.sent); English fallbacks used until merged.
