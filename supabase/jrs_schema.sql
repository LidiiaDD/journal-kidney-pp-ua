-- Run ONLY in a new, dedicated Supabase project for Journal of Renal Science.
-- Do not run this in another website's or application’s database.
-- No users are granted editor access automatically.

create table if not exists public.jrs_editors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.jrs_editors enable row level security;
revoke all on public.jrs_editors from anon, authenticated;
grant select on public.jrs_editors to anon, authenticated;

create policy "jrs_editor_can_see_own_membership"
  on public.jrs_editors for select to authenticated
  using (user_id = (select auth.uid()));

create table if not exists public.jrs_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,100}$'),
  title text not null check (char_length(title) between 5 and 500),
  abstract text not null check (char_length(abstract) between 20 and 15000),
  type text not null check (type in ('original-research','review','case-report','brief-report','perspective')),
  language text not null default 'uk' check (language in ('uk','en')),
  authors jsonb not null default '[]'::jsonb check (jsonb_typeof(authors) = 'array'),
  keywords text[] not null default '{}'::text[],
  status text not null default 'draft' check (status in ('draft','published')),
  published_at date,
  pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jrs_published_has_date check (status <> 'published' or published_at is not null)
);
create index if not exists jrs_articles_status_published_idx
  on public.jrs_articles (status, published_at desc);
alter table public.jrs_articles enable row level security;

revoke all on public.jrs_articles from anon, authenticated;
grant select on public.jrs_articles to anon, authenticated;
grant insert, update, delete on public.jrs_articles to authenticated;

create policy "jrs_see_published_or_editor"
  on public.jrs_articles for select to anon, authenticated
  using (
    status = 'published'
    or exists (select 1 from public.jrs_editors e where e.user_id = (select auth.uid()))
  );
create policy "jrs_insert_editor_only"
  on public.jrs_articles for insert to authenticated
  with check (exists (select 1 from public.jrs_editors e where e.user_id = (select auth.uid())));
create policy "jrs_update_draft_only"
  on public.jrs_articles for update to authenticated
  using (
    status = 'draft'
    and exists (select 1 from public.jrs_editors e where e.user_id = (select auth.uid()))
  )
  with check (
    exists (select 1 from public.jrs_editors e where e.user_id = (select auth.uid()))
  );
create policy "jrs_delete_editor_only"
  on public.jrs_articles for delete to authenticated
  using (exists (select 1 from public.jrs_editors e where e.user_id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('jrs-pdfs','jrs-pdfs',false,3670016,array['application/pdf'])
on conflict (id) do nothing;

-- The bucket is PRIVATE; published articles are readable only through
-- authorized Storage API calls passing RLS checks.
create policy "jrs_storage_read_published_or_editor"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'jrs-pdfs'
    and (
      exists (
        select 1 from public.jrs_articles a
        where a.pdf_path = name and a.status = 'published'
      )
      or exists (select 1 from public.jrs_editors e where e.user_id = (select auth.uid()))
    )
  );
create policy "jrs_storage_upload_editor_only"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'jrs-pdfs'
    and split_part(name, '/', 1) = (select auth.uid())::text
    and exists (select 1 from public.jrs_editors e where e.user_id = (select auth.uid()))
  );
create policy "jrs_storage_delete_unpublished_only"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'jrs-pdfs'
    and exists (select 1 from public.jrs_editors e where e.user_id = (select auth.uid()))
    and not exists (
      select 1 from public.jrs_articles a
      where a.pdf_path = name and a.status = 'published'
    )
  );

-- AFTER CREATING EXACTLY ONE editor account in Authentication > Users:
-- replace the placeholder below with THAT account's real UUID and execute it.
--
-- insert into public.jrs_editors (user_id)
-- values ('00000000-0000-0000-0000-000000000000');
--
-- Never put this SQL into public app code with a real UUID and do not grant
-- editor rights based on email or user-editable metadata.
