# Journal of Renal Science (JRS)

Website of an **independent scientific and informational online journal** focused on nephrology, kidney disease, dialysis, transplantation, and renal research.

The journal is currently developing its editorial process and publication archive. Do not infer a formal indexed or accredited journal status, DOI, or ISSN where none has been verified.

## Public pages

- `/` — journal homepage and editorial board
- `/publications` — searchable archive (initially empty)
- `/publications/[slug]` — individual article page, generated when an approved publication is added
- `/authors` — submission guidelines
- `/editorial-policy` — current editorial and research-ethics policies

## Adding research publications

See **[docs/PUBLISHING.md](docs/PUBLISHING.md)** for the approval checklist, PDF upload instructions, and metadata format. Publication records are maintained in `app/lib/publications.ts`.

## Development

Built with Next.js 16, React 19, and TypeScript. For a local setup with dependencies installed, use `npm ci`, then `npm run dev` or `npm run build`.

Research manuscripts received by email must remain private until approval. **Never commit nonpublic manuscripts or patient-identifying files to this repository.**
