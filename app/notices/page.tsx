import type { Metadata } from "next";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import { allPublicNotices, formatNoticeDate, noticeLabels, noticeUrl } from "@/app/lib/jrs-notices";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Офіційні редакційні повідомлення | Journal of Renal Science",
  description: "Публічний реєстр виправлень, повідомлень про занепокоєння та відкликань статей Journal of Renal Science.",
  alternates: { canonical: "/notices", languages: { uk: "/notices", en: "/en/notices" } },
};

export default async function NoticesRegistryPage() {
  const notices = await allPublicNotices();
  const retractions = notices.filter(item => item.kind === "retraction").length;
  const concerns = notices.filter(item => item.kind === "concern").length;
  const corrections = notices.filter(item => item.kind === "correction").length;

  return (
    <JournalInfoLayout
      eyebrow="Редакційні повідомлення"
      title="Науковий запис має залишатися чесним."
      description="Відкритий реєстр виправлень, занепокоєнь та відкликань: що змінилося, чому і як це стосується конкретної публікації."
      sections={[]}
      wide
    >
      <a className="jrs-en-article-uk-switch" href="/en/notices" hrefLang="en">English editorial notices ↗</a>
      <div className="jrs-notices-register-intro">
        <div>
          <span>JRS / PUBLIC EDITORIAL RECORD</span>
          <h2>Прозорість не закінчується датою публікації.</h2>
          <p>Кожне рішення редакції фіксується окремим відкритим повідомленням із датою та посиланням на роботу. Первісна публікація не редагується приховано.</p>
        </div>
        <div className="jrs-notices-register-counters" aria-label="Статистика редакційних повідомлень">
          <div><strong>{corrections}</strong><span>виправлень</span></div>
          <div><strong>{concerns}</strong><span>занепокоєнь</span></div>
          <div><strong>{retractions}</strong><span>відкликань</span></div>
        </div>
      </div>

      {notices.length === 0 ? (
        <div className="jrs-notices-empty">
          <span aria-hidden="true">✳</span>
          <h2>Офіційних повідомлень поки немає.</h2>
          <p>Реєстр відкрито заздалегідь. Якщо редакція оприлюднить виправлення, повідомлення про занепокоєння або відкликання, воно з’явиться тут автоматично.</p>
          <a href="/publications">Переглянути науковий каталог ↗</a>
        </div>
      ) : (
        <ol className="jrs-notices-register-list">
          {notices.map((notice, index) => (
            <li key={notice.id} className={`jrs-notices-register-item is-${notice.kind}`}>
              <span className="jrs-notices-register-number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <div className="jrs-notices-register-meta">
                  <span>{noticeLabels[notice.kind]}</span>
                  <time dateTime={notice.issued_at}>{formatNoticeDate(notice.issued_at)}</time>
                </div>
                <h3><a href={noticeUrl(notice.id)}>{notice.title}</a></h3>
                <p>{notice.explanation.length > 400 ? notice.explanation.slice(0, 400).trimEnd() + "…" : notice.explanation}</p>
                <div className="jrs-notices-register-actions">
                  <a href={noticeUrl(notice.id)}>Читати офіційне повідомлення ↗</a>
                  <a href={`/publications/${notice.jrs_articles.slug}`}>Стаття: {notice.jrs_articles.title} ↗</a>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="jrs-notices-guidance">
        <strong>Навіщо потрібен цей реєстр?</strong>
        <p>Виправлення усуває конкретну помилку; повідомлення про занепокоєння інформує про невирішені питання; відкликання попереджає про ненадійність висновків. Такі рішення не повинні використовуватися як бездоказове звинувачення авторів.</p>
        <p>Дізнайтеся більше в <a href="/editorial-policy#corrections">редакційній політиці JRS</a>.</p>
        <p>Щоб отримувати повідомлення про нові виправлення чи відкликання, скористайтеся <a href="/feed.xml" type="application/rss+xml">RSS-стрічкою JRS ↗</a>.</p>
      </div>
    </JournalInfoLayout>
  );
}
