-- JRS public article transparency passport — additive migration (2026-10-26).
-- Statements must reflect authors' actual declarations and editorial records.
-- Existing articles remain unchanged. All fields are optional for drafts.

alter table public.jrs_articles
  add column if not exists review_kind text,
  add column if not exists review_details text,
  add column if not exists ethics_statement text,
  add column if not exists consent_statement text,
  add column if not exists funding_statement text,
  add column if not exists competing_interests text,
  add column if not exists data_availability text,
  add column if not exists author_contributions text,
  add column if not exists ai_disclosure text;

alter table public.jrs_articles
  add constraint jrs_review_kind_valid
    check (review_kind is null or review_kind in ('editorial','external')),
  add constraint jrs_review_external_documented
    check (review_kind <> 'external' or
      (review_details is not null and char_length(btrim(review_details)) >= 20)),
  add constraint jrs_published_review_declared
    check (status <> 'published' or review_kind is not null),
  add constraint jrs_passport_field_lengths
    check (
      (review_details is null or char_length(review_details) <= 2000) and
      (ethics_statement is null or char_length(ethics_statement) <= 3500) and
      (consent_statement is null or char_length(consent_statement) <= 3500) and
      (funding_statement is null or char_length(funding_statement) <= 3500) and
      (competing_interests is null or char_length(competing_interests) <= 3500) and
      (data_availability is null or char_length(data_availability) <= 3500) and
      (author_contributions is null or char_length(author_contributions) <= 3500) and
      (ai_disclosure is null or char_length(ai_disclosure) <= 3500)
    );

comment on column public.jrs_articles.review_kind is
  'editorial = editorial consideration only; external = completed, independently documented review. Never inferred automatically.';
comment on column public.jrs_articles.review_details is
  'Explanation of actual review process; mandatory when independent external review is claimed.';
