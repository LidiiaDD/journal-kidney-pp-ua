-- Additional safeguards for the 2026-10-26 editor workflow.
-- Run only on the dedicated Journal of Renal Science database.
-- Existing articles and drafts are not deleted or changed.

alter table public.jrs_articles
  add column if not exists publication_checks jsonb not null default '{}'::jsonb,
  add column if not exists published_by uuid references auth.users(id);

-- Publication requires four explicit editor checks stored with the
-- publishing user. The unchanged published-row RLS policy prevents
-- later edits through the editorial interface.
alter table public.jrs_articles
  add constraint jrs_editor_checklist_on_publish check (
    status <> 'published'
    or (
      publication_checks ->> 'authors' = 'true'
      and publication_checks ->> 'ethics' = 'true'
      and publication_checks ->> 'privacy' = 'true'
      and publication_checks ->> 'accuracy' = 'true'
      and published_by is not null
    )
  );
