-- Round 3: records when an account that joined with an email link (no password)
-- set its first password, or when the admin reset it. Backward compatible (nullable column).
alter table users add column if not exists password_set_at timestamptz;
