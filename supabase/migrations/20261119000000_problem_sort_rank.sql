-- Round 4: pin the six sharpest problems to the top of every list. Null = after them, newest first.
-- Backward compatible: a nullable column that older code simply ignores.
alter table public.problems add column if not exists sort_rank int;
