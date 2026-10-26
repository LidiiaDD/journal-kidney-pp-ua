-- Applied to dedicated JRS Supabase on 2026-10-26.
-- Non-destructive addition of optional bilingual metadata and bibliography.

alter table public.jrs_articles
  add column if not exists title_uk text,
  add column if not exists abstract_uk text,
  add column if not exists keywords_uk text[] not null default '{}'::text[],
  add column if not exists title_en text,
  add column if not exists abstract_en text,
  add column if not exists keywords_en text[] not null default '{}'::text[],
  add column if not exists references_list text[] not null default '{}'::text[],
  add column if not exists doi text,
  add column if not exists volume text,
  add column if not exists issue text,
  add column if not exists pages text;

alter table public.jrs_articles
  add constraint jrs_translation_uk_complete check (
    (title_uk is null and abstract_uk is null and cardinality(keywords_uk) = 0)
    or (char_length(title_uk) between 5 and 500
        and char_length(abstract_uk) between 20 and 15000
        and cardinality(keywords_uk) between 1 and 20)
  ),
  add constraint jrs_translation_en_complete check (
    (title_en is null and abstract_en is null and cardinality(keywords_en) = 0)
    or (char_length(title_en) between 5 and 500
        and char_length(abstract_en) between 20 and 15000
        and cardinality(keywords_en) between 1 and 20)
  ),
  add constraint jrs_doi_format check (
    doi is null or doi ~ '^10[.]([0-9]{4,9})/[^[:space:]]+$'
  ),
  add constraint jrs_references_count check (cardinality(references_list) <= 150);

comment on column public.jrs_articles.doi is
  'Only a genuinely registered DOI may be entered; database validates syntax, not DOI registration.';
