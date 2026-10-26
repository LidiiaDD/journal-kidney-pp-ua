-- JRS official post-publication editorial notices. Additive and non-destructive.
-- An issued notice is append-only through the public/authenticated Data API.
create table if not exists public.jrs_article_notices (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.jrs_articles(id) on delete restrict,
  kind text not null check (kind in ('correction','concern','retraction')),
  title text not null check (char_length(btrim(title)) between 10 and 220),
  explanation text not null check (char_length(btrim(explanation)) between 40 and 10000),
  issued_by uuid not null references auth.users(id) on delete restrict,
  issued_at timestamptz not null default now()
);

create index if not exists jrs_notices_article_date_idx
  on public.jrs_article_notices (article_id, issued_at desc);
create index if not exists jrs_notices_date_idx
  on public.jrs_article_notices (issued_at desc);

alter table public.jrs_article_notices enable row level security;
revoke all on public.jrs_article_notices from anon, authenticated;
grant select on public.jrs_article_notices to anon, authenticated;
grant insert on public.jrs_article_notices to authenticated;

create policy jrs_notices_read_published
on public.jrs_article_notices
for select to anon, authenticated
using (
  exists (
    select 1 from public.jrs_articles a
    where a.id = article_id and a.status = 'published'
  )
);

create policy jrs_notices_insert_editor_published
on public.jrs_article_notices
for insert to authenticated
with check (
  issued_by = (select auth.uid())
  and exists (
    select 1 from public.jrs_editors e
    where e.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.jrs_articles a
    where a.id = article_id and a.status = 'published'
  )
);

comment on table public.jrs_article_notices is
  'Public editorial notices for articles after release: correction, expression of concern, or retraction. No end-user UPDATE/DELETE privileges or policies.';
