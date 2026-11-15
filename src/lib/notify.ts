import "server-only";
import { q, J } from "./db";

export type NotificationType =
  | "taken_up" | "withdrawn" | "message" | "submitted" | "receipt_confirmed" | "status_changed"
  | "impact_update" | "report_regenerated" | "update_due" | "verification_approved" | "verification_rejected" | "verification_requested";

export async function notify(userId: string, type: NotificationType, payload: Record<string, unknown> = {}) {
  await q(`insert into notifications (user_id, type, payload) values ($1,$2,$3::jsonb)`, [userId, type, J(payload)]);
}

export async function unreadCount(userId: string) {
  const r = await q<{ n: number }>(`select count(*)::int as n from notifications where user_id = $1 and read = false`, [userId]);
  return r[0]?.n ?? 0;
}
