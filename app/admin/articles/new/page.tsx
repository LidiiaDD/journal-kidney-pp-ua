import { requireEditor } from "@/app/lib/jrs-supabase";
import ArticleForm from "../../components/ArticleForm";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function NewArticlePage({ searchParams }: Props) {
  await requireEditor();
  const { error } = await searchParams;
  return (
    <main className="jrs-admin-main">
      <div className="wrap">
        <a href="/admin" className="jrs-admin-back">← Матеріали журналу</a>
        <div className="jrs-admin-heading"><div>
          <p className="jrs-admin-kicker">Новий рукопис</p>
          <h1>Створення чернетки</h1>
          <p>Матеріал буде приватним до окремого редакційного рішення про публікацію.</p>
        </div></div>
        <ArticleForm error={error} />
      </div>
    </main>
  );
}
