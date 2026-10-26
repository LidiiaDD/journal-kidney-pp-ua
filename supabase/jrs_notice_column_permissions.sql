-- Tighten JRS notice Data API permissions after table creation.
-- Public readers need only the notice content, not editors' Auth user IDs.
-- Editors may submit notices but cannot supply their own issue timestamps.
revoke all on public.jrs_article_notices from anon, authenticated;

grant select (id, article_id, kind, title, explanation, issued_at)
  on public.jrs_article_notices to anon, authenticated;

grant insert (article_id, kind, title, explanation, issued_by)
  on public.jrs_article_notices to authenticated;
