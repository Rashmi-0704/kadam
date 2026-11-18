import "server-only";
import { q, one, J } from "./db";
import { saveUpload } from "./storage";
import { notify } from "./notify";
import { readStudentId } from "./ai/services";
import { tryLock, unlock } from "./ai/guard";

export const ID_MAX_BYTES = 4 * 1024 * 1024;
export const isIdType = (type: string) => /^(image\/|application\/pdf)/.test(type);

/**
 * Round 5: a student ID, uploaded at sign-up or from the profile. Never a gate.
 * Stores the file privately, adds it to the admin's "IDs to check", marks the student verified (the "ID checked" tick
 * businesses see) and reads college, course and year with one Gemini call, saved straight to the profile.
 * Throws only on a bad file or a storage failure; a failed or empty reading saves nothing and says nothing.
 */
export async function handleStudentId(user: { id: string; name?: string | null }, file: File): Promise<void> {
  if (file.size === 0 || file.size > ID_MAX_BYTES || !isIdType(file.type)) throw new Error("bad_file");
  const stored = await saveUpload("student-ids", `ids/${user.id}`, file);
  await q(`insert into student_profiles (user_id, verification_status) values ($1,'not_started') on conflict (user_id) do nothing`, [user.id]);
  await q(`update student_profiles set verification_method = 'id_upload', verification_status = 'verified', updated_at = now() where user_id = $1`, [user.id]);
  await q(`insert into verification_requests (student_id, method, id_file, status) values ($1,'id_upload',$2::jsonb,'verified')`, [user.id, J(stored)]);
  const admins = await q(`select id from users where role = 'admin'`);
  for (const a of admins) await notify(a.id, "verification_requested", { student: user.name });

  // One reading per upload, at most 3 per student per day; a double tap reads once.
  const countKey = `read_id:${user.id}:${new Date().toISOString().slice(0, 10)}`;
  const used = Number((await one(`select value from ai_cache where key = $1`, [countKey]))?.value ?? 0);
  if (used >= 3 || !(await tryLock(`read_id:${user.id}`, 40))) return;
  await q(`insert into ai_cache (key, value) values ($1,$2::jsonb) on conflict (key) do update set value = excluded.value`, [countKey, J(used + 1)]);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const read = await readStudentId({ bytes, mime: file.type }).catch(() => null).finally(() => unlock(`read_id:${user.id}`));
  if (!read || !read.looks_like_student_id) return;
  // Only non-empty values replace what is there.
  await q(
    `update student_profiles set college = coalesce(nullif($2,''), college), course = coalesce(nullif($3,''), course), year = coalesce(nullif($4,''), year), updated_at = now() where user_id = $1`,
    [user.id, read.college, read.course, read.year],
  );
}
