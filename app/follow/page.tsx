import type { Metadata } from "next";
import JournalInfoLayout from "@/app/components/JournalInfoLayout";
import FeedCopyButton from "@/app/components/FeedCopyButton";

export const metadata: Metadata = {
  title: "Стежити за JRS | RSS-підписка",
  description: "Підпишіться на оновлення Journal of Renal Science через RSS: усі новини, наукові публікації або офіційні виправлення й відкликання.",
  alternates: { canonical: "/follow" },
};

const feeds = [
  {
    num: "01",
    title: "Усі оновлення JRS",
    english: "Complete editorial feed",
    description: "Нові наукові публікації разом з офіційними редакційними повідомленнями в одній стрічці.",
    url: "https://journal.kidney.pp.ua/feed.xml",
    tag: "Статті + редакційні рішення",
    featured: true,
  },
  {
    num: "02",
    title: "Нові наукові статті",
    english: "Research publications",
    description: "Лише фактично опубліковані дослідження. Зручно для читачів, які шукають нові роботи з нефрології.",
    url: "https://journal.kidney.pp.ua/feeds/articles.xml",
    tag: "Лише публікації",
    featured: false,
  },
  {
    num: "03",
    title: "Виправлення та відкликання",
    english: "Editorial notices",
    description: "Окрема стрічка для виправлень, повідомлень про занепокоєння та відкликань. Допомагає стежити за станом наукового запису.",
    url: "https://journal.kidney.pp.ua/feeds/notices.xml",
    tag: "Лише офіційні повідомлення",
    featured: false,
  },
];

export default function FollowJrsPage() {
  return (
    <JournalInfoLayout
      eyebrow="Стежити за журналом"
      title="Наука оновлюється. Будьте поруч."
      description="Виберіть, що читати далі: нові дослідження, редакційні повідомлення або обидва типи оновлень. RSS працює без реєстрації."
      sections={[]}
      wide
    >
      <div className="jrs-follow-intro">
        <div>
          <span className="jrs-follow-eyebrow">JRS / OPEN SCHOLARLY UPDATES</span>
          <h2>Ваш особистий маршрут до нових публікацій.</h2>
          <p>У RSS-читалці нові матеріали з’являються автоматично після їхнього оприлюднення на сайті. Оберіть одну стрічку або підпишіться на декілька.</p>
        </div>
        <div className="jrs-follow-symbol" aria-hidden="true">
          <span className="jrs-follow-orbit one" />
          <span className="jrs-follow-orbit two" />
          <span className="jrs-follow-waves"><i/><i/><i/></span>
        </div>
      </div>

      <div className="jrs-feed-cards">
        {feeds.map(feed => (
          <section key={feed.num} className={`jrs-feed-card${feed.featured ? " is-featured" : ""}`}>
            <div className="jrs-feed-card-top">
              <span>JRS / FEED {feed.num}</span>
              <span className="jrs-feed-card-icon" aria-hidden="true">↗</span>
            </div>
            <p className="jrs-feed-card-english">{feed.english}</p>
            <h3>{feed.title}</h3>
            <p className="jrs-feed-card-description">{feed.description}</p>
            <span className="jrs-feed-card-tag">{feed.tag}</span>
            <div className="jrs-feed-card-actions">
              <a href={feed.url} type="application/rss+xml">Відкрити RSS ↗</a>
              <FeedCopyButton url={feed.url}/>
            </div>
          </section>
        ))}
      </div>

      <div className="jrs-follow-steps">
        <div>
          <span className="jrs-follow-eyebrow">HOW TO SUBSCRIBE</span>
          <h2>Як підписатися?</h2>
          <p>Це не розсилка електронною поштою: адреса читалки повідомляє їй, які відкриті матеріали з’явилися в журналі.</p>
        </div>
        <ol>
          <li><strong>Оберіть стрічку.</strong><span>Скопіюйте її RSS-адресу кнопкою вище.</span></li>
          <li><strong>Відкрийте RSS-читалку.</strong><span>Додайте нове джерело за посиланням у застосунку, яким користуєтесь.</span></li>
          <li><strong>Читайте оновлення.</strong><span>Після публікації статті чи повідомлення читалка зможе отримати його під час наступної перевірки.</span></li>
        </ol>
      </div>

      <div className="jrs-follow-caveat">
        <span aria-hidden="true">✳</span>
        <div>
          <strong>Лише публічні матеріали — жодних фіктивних анонсів</strong>
          <p>Поки в журналі немає опублікованих робіт чи повідомлень, відповідні RSS-стрічки залишаються порожніми. Чернетки та персональні дані пацієнтів не потрапляють до стрічок. Підписку зберігає ваша RSS-читалка, а не редакція JRS. Частота оновлень залежить від читалки.</p>
        </div>
      </div>
    </JournalInfoLayout>
  );
}
