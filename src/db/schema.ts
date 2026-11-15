// Canonical schema. `node scripts/db.ts write-migration` copies this into supabase/migrations.
// All access goes through the server (direct Postgres connection), so RLS is enabled
// with no policies: the anon/public API keys can read nothing.
export const SCHEMA_SQL = `


create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  role text check (role in ('student','business','admin')),
  name text,
  email text not null unique,
  phone text,
  language_pref text not null default 'en',
  consent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists student_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  college text,
  course text,
  year text,
  verification_method text check (verification_method in ('email_otp','id_upload')),
  verification_status text not null default 'not_started'
    check (verification_status in ('not_started','pending','verified','rejected')),
  college_email text,
  cv_file jsonb,
  cv_text text,
  cv_parsed jsonb,
  intake_transcript jsonb not null default '[]'::jsonb,
  intake_summary jsonb,
  target_roles jsonb not null default '[]'::jsonb,
  job_links jsonb not null default '[]'::jsonb,
  pathways jsonb,
  approved_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists verification_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references users(id) on delete cascade,
  method text not null check (method in ('email_otp','id_upload')),
  id_file jsonb,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  note text,
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references users(id),
  reviewed_at timestamptz
);

create table if not exists business_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  business_name text not null,
  type text,
  sector text,
  city text,
  contact_verified boolean not null default false
);

create table if not exists problems (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references users(id) on delete cascade,
  raw_input jsonb not null default '{}'::jsonb,
  intake jsonb not null default '[]'::jsonb,
  title text,
  background text,
  current_process text,
  problem text,
  desired_outcome text,
  constraints text,
  expected_timeline text,
  resources_provided text,
  categories jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','live','closed')),
  created_at timestamptz not null default now(),
  live_at timestamptz
);
create index if not exists problems_status_idx on problems(status);

create table if not exists engagements (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references problems(id) on delete cascade,
  student_id uuid not null references users(id) on delete cascade,
  status text not null default 'taken_up' check (status in
    ('taken_up','in_progress','submitted','received','accepted','in_use','needs_changes','rejected','withdrawn')),
  share_token text not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 24),
  started_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  last_reminder_at timestamptz,
  unique (problem_id, student_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  text text,
  file jsonb,
  created_at timestamptz not null default now()
);
create index if not exists messages_eng_idx on messages(engagement_id, created_at);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  description text not null,
  links jsonb not null default '[]'::jsonb,
  files jsonb not null default '[]'::jsonb,
  submitted_at timestamptz not null default now(),
  receipt_confirmed_at timestamptz
);

create table if not exists status_changes (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  status text not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists impact_updates (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  what_changed text not null,
  metrics jsonb not null default '{}'::jsonb,
  comments text,
  created_at timestamptz not null default now()
);

create table if not exists impact_reports (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  version int not null,
  summary text not null,
  outcomes jsonb not null default '[]'::jsonb,
  skills_demonstrated jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  resume_bullets jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  share_token text not null,
  unique (engagement_id, version)
);

create table if not exists roadmaps (
  role text primary key,
  title text not null,
  summary text,
  steps jsonb not null,
  source text not null default 'seed',
  created_at timestamptz not null default now()
);

create table if not exists roadmap_progress (
  student_id uuid not null references users(id) on delete cascade,
  role text not null,
  completed_step_ids jsonb not null default '[]'::jsonb,
  primary key (student_id, role)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications(user_id, created_at desc);

create table if not exists ai_cache (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now()
);

-- Used for file storage only when Supabase Storage is not configured.
create table if not exists blobs (
  path text primary key,
  content_type text,
  data bytea not null,
  created_at timestamptz not null default now()
);

alter table users enable row level security;
alter table student_profiles enable row level security;
alter table verification_requests enable row level security;
alter table business_profiles enable row level security;
alter table problems enable row level security;
alter table engagements enable row level security;
alter table messages enable row level security;
alter table submissions enable row level security;
alter table status_changes enable row level security;
alter table feedback enable row level security;
alter table impact_updates enable row level security;
alter table impact_reports enable row level security;
alter table roadmaps enable row level security;
alter table roadmap_progress enable row level security;
alter table notifications enable row level security;
alter table ai_cache enable row level security;
alter table blobs enable row level security;
`;
