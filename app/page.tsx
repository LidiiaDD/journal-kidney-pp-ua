import { formatPublicationDate, publicationTypeLabels } from "@/app/lib/publications";
import { allPublications } from "@/app/lib/jrs-catalogue";
import { groupPublishedIssues, issueHref } from "@/app/lib/jrs-issues";
import { authorEntries } from "@/app/lib/jrs-contributors";

const directions = [
  ["01", "Клінічна нефрологія", "Діагностика, профілактика й лікування гострих та хронічних захворювань нирок."],
  ["02", "Діаліз і НЗТ", "Гемодіаліз, перитонеальний діаліз, безперервні методики та якість лікування."],
  ["03", "Трансплантація", "Імунологія, ведення реципієнтів, ускладнення та довгострокові результати."],
  ["04", "Біомаркери", "Трансляційні дослідження, генетика, візуалізація та нові діагностичні підходи."],
];

const stages = [
  ["01", "Первинна перевірка", "Відповідність тематиці, структурі рукопису та етичним вимогам."],
  ["02", "Наукова оцінка", "Оцінювання змісту, методології та достовірності результатів із залученням фахівців за потреби."],
  ["03", "Редакційне рішення", "Аргументоване рішення, рекомендації автору та можливість доопрацювання."],
];

const Arrow = () => <span aria-hidden="true">↗</span>;
export const dynamic = "force-dynamic";

export default async function Home() {
  const publications = await allPublications();
  const latestPublications = publications.slice(0, 3);
  const latestIssue = groupPublishedIssues(publications)[0];
  const contributorCount = authorEntries(publications).length;
  return (
    <main>
      <div className="topline">
        <div className="wrap">
          <span>Independent · Research · Open access</span>
          <a href="mailto:editor@kidney.pp.ua">editor@kidney.pp.ua <Arrow /></a>
        </div>
      </div>

      <header className="header">
        <div className="wrap header-inner">
          <a href="#top" className="brand" aria-label="Journal of Renal Science — на головну">
            <span className="logo" aria-hidden="true"><b>J</b><b>R</b><b>S</b></span>
            <span><strong>Journal of Renal Science</strong><small>Незалежне видання з нефрології</small></span>
          </a>
          <nav aria-label="Головна навігація">
            <a href="#about">Про журнал</a>
            <a href="/topics">Атлас</a>
            <a href="/publications">Публікації</a>
            <a href="/contributors">Дослідники</a>
            <a href="/authors">Авторам</a>
            <a href="/editorial-policy">Політика</a>
            <a href="/issues">Випуски</a>
          </nav>
          <a className="submit" href="mailto:editor@kidney.pp.ua?subject=Подання рукопису до Journal of Renal Science">
            Подати рукопис
          </a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><i /> Незалежний науково-інформаційний журнал</p>
            <h1>Renal science.<br /><em>Clinical impact.</em></h1>
            <p className="lead">
              Незалежний науково-інформаційний онлайн-журнал про дослідження
              хвороб нирок, діаліз, трансплантацію та клінічну практику.
            </p>
            <div className="hero-actions">
              <a className="primary" href="/authors">Інформація для авторів <Arrow /></a>
              <a className="quiet-link" href="/topics">Атлас досліджень <span>↗</span></a>
            </div>
            <div className="values">
              <span>Наукова оцінка матеріалів</span><span>Відкритий доступ</span>
              <span>Доказова медицина</span><span>Публікаційна етика</span>
            </div>
          </div>

          <div className="cover-stage">
            <div className="orbit large" /><div className="orbit small" />
            <article className="cover">
              <div className="cover-meta"><span>Journal of</span><span>{latestIssue ? latestIssue.latestArticleDate.slice(0,4) : new Date().getFullYear()}</span></div>
              <div className="cover-name"><strong>RENAL</strong><strong>SCIENCE</strong></div>
              <div className="renal-art" aria-hidden="true"><i /><i /></div>
              <div className="cover-meta"><span>Nephrology · Dialysis</span><span>Transplantation</span></div>
            </article>
            <a className="issue-status" href={latestIssue ? issueHref(latestIssue.key) : "/issues"}>
              <i />
              {latestIssue
                ? <span><small>Архів випусків JRS</small><strong>Том {latestIssue.volume} · № {latestIssue.number} ↗</strong></span>
                : <span><small>Перший випуск</small><strong>У підготовці ↗</strong></span>}
            </a>
          </div>
        </div>
      </section>

      <div className="ticker">
        <span>Nephrology</span><i /><span>Dialysis</span><i /><span>Transplantation</span>
        <i /><span>Renal biomarkers</span><i /><span>Clinical research</span>
      </div>

      <section className="section about" id="about">
        <div className="wrap split">
          <p className="section-tag"><span>01</span> Про журнал</p>
          <div>
            <h2 className="statement">
              Простір, де якісна наука стає зрозумілою, видимою і корисною для
              нефрологічної спільноти.
            </h2>
            <div className="two-columns">
              <p>
                Journal of Renal Science створено для публікації оригінальних досліджень,
                оглядових статей, коротких повідомлень та описів клінічних випадків
                у сфері нефрології й суміжних дисциплін.
              </p>
              <p>
                Редакційний процес ґрунтується на науковій доброчесності,
                прозорості рішень та повазі до авторів, рецензентів і читачів.
                Матеріали журналу поширюються у відкритому доступі.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section scope" id="scope">
        <div className="wrap">
          <div className="scope-heading">
            <div><p className="eyebrow pale"><i /> Сфера наукових інтересів</p>
              <h2>Від фундаментальних механізмів — до клінічного рішення.</h2>
            </div>
            <p>Журнал об’єднує дослідників, клініцистів і фахівців суміжних напрямів навколо сучасної науки про нирки.</p>
          </div>
          <div className="direction-grid">
            {directions.map(([number, title, text]) => (
              <article key={number}><span>{number}</span><b>↗</b><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
          <a className="scope-atlas-link" href="/topics">
            <span className="scope-atlas-index">JRS · RESEARCH ATLAS</span>
            <span className="scope-atlas-title">Вісім напрямів ниркової науки <em>— знайдіть свій.</em></span>
            <span className="scope-atlas-icon" aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className="section pub-feature" id="publications">
        <div className="wrap split">
          <p className="section-tag"><span>02</span> Публікації</p>
          <div>
            <p className="eyebrow"><i /> Research & clinical insights</p>
            <h2>Наукові результати, доступні кожному.</h2>
            <p className="pub-feature-intro">
              Оригінальні дослідження, оглядові роботи та клінічні спостереження.
              Кожна публікація матиме власну сторінку з анотацією,
              авторами, ключовими словами та повним текстом PDF за наявності.
            </p>
            {latestPublications.length > 0 ? (
              <div className="pub-feature-list">
                {latestPublications.map((item) => (
                  <article key={item.slug}>
                    <p>{publicationTypeLabels[item.type]} · {formatPublicationDate(item.publishedAt)}</p>
                    <h3><a href={`/publications/${item.slug}`}>{item.title} ↗</a></h3>
                    <span>{item.authors.map((author) => author.name).join(", ")}</span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="pub-feature-pending">
                <span aria-hidden="true">01 / JRS</span>
                <div>
                  <strong>Перші наукові матеріали готуються</strong>
                  <p>Каталог відкрито; записи з’являться після фактичної публікації досліджень.</p>
                </div>
              </div>
            )}
            <a className="pub-feature-link" href="/publications">
              Переглянути каталог публікацій <Arrow />
            </a>
            <a className="reading-feature-link" href="/reading-list">
              <span className="reading-feature-icon" aria-hidden="true">♧</span>
              <span><small>JRS PERSONAL READING SHELF</small><strong>Моя наукова бібліотека</strong><em>Зберігайте цікаві дослідження для подальшого читання.</em></span>
              <b aria-hidden="true">↗</b>
            </a>
          </div>
        </div>
      </section>

      <section className="jrs-home-contributors">
        <div className="wrap jrs-home-contributors-inner">
          <div className="jrs-home-contributors-graphic" aria-hidden="true">
            <span className="jrs-home-contributors-initial">A</span>
            <span className="jrs-home-contributors-ring one"/>
            <span className="jrs-home-contributors-ring two"/>
          </div>
          <div className="jrs-home-contributors-copy">
            <p>JRS / RESEARCH COMMUNITY</p>
            <h2>Імена, що стоять <em>за дослідженнями.</em></h2>
            <span>Бібліографічний покажчик авторів і наукових робіт. З'являється разом із опублікованими статтями, без вигаданих персональних профілів.</span>
            <a href="/contributors">Відкрити покажчик авторів ↗</a>
          </div>
          <div className="jrs-home-contributors-count"><strong>{contributorCount}</strong><span>авторських записів</span></div>
        </div>
      </section>

      <section className="section jrs-home-issues">
        <div className="wrap jrs-home-issues-inner">
          <div className="jrs-home-issues-glyph" aria-hidden="true">
            <span className="jrs-home-issues-symbol">JRS</span>
            <span className="jrs-home-issues-orbit a"/>
            <span className="jrs-home-issues-orbit b"/>
          </div>
          <div className="jrs-home-issues-copy">
            <p className="jrs-home-issues-overline">JRS · ISSUE ARCHIVE</p>
            <h2>Випуски, які хочеться <em>зберігати.</em></h2>
            <p>{latestIssue
              ? `Архів вже містить публікації, віднесені до тому ${latestIssue.volume}, випуску ${latestIssue.number}. Перегляньте зміст і добірку досліджень.`
              : "Перший випуск ще готується. Обкладинки й зміст з’являться тільки разом із фактично опублікованими роботами."}</p>
            <a href="/issues">Відкрити архів випусків ↗</a>
          </div>
          <span className="jrs-home-issues-index">VOL. / NO.</span>
        </div>
      </section>

      <section className="section authors" id="authors">
        <div className="wrap">
          <div className="split">
            <p className="section-tag"><span>03</span> Для авторів</p>
            <div><h2>Ясні вимоги.<br />Наукова оцінка.</h2>
              <p className="intro">Ми прагнемо зробити шлях рукопису передбачуваним і професійним на кожному етапі.</p>
            </div>
          </div>
          <div className="stage-grid">
            {stages.map(([number, title, text]) => (
              <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
          <div className="resources">
            <div><small>Перед поданням</small><h3>Підготуйте рукопис відповідно до стандартів журналу</h3></div>
            <div>
              <a href="/submission-studio">Майстер подання статті <Arrow /></a>
              <a href="/manuscript-checklist">Навігатор рукопису <Arrow /></a>
              <a href="/authors#format">Правила оформлення <Arrow /></a>
              <a href="/editorial-policy#research-ethics">Етичні вимоги <Arrow /></a>
              <a href="/editorial-policy#review">Редакційний розгляд <Arrow /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="section board" id="board">
        <div className="wrap split">
          <p className="section-tag"><span>04</span> Редакційна рада</p>
          <div>
            <p className="eyebrow"><i /> Editorial board</p>
            <h2>Наукова відповідальність починається з редакції.</h2>
            <p className="board-lead">
              Редакційна рада визначає тематичний розвиток незалежного
              науково-інформаційного журналу та засади оцінювання матеріалів.
            </p>
            <div className="board-member">
              <div aria-hidden="true">LD</div>
              <span>
                <small>Редакційна рада · Editorial board</small>
                <h3>Лідія Данилівна Денова</h3>
                <p>Лікар-нефролог, доктор філософії (PhD) за спеціальністю
                  222 «Медицина»; науковий напрям — нефрологія.</p>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="jrs-home-follow">
        <div className="wrap jrs-home-follow-inner">
          <div className="jrs-home-follow-logo" aria-hidden="true">
            <span className="jrs-home-follow-waves"><i/><i/><i/></span>
          </div>
          <div className="jrs-home-follow-copy">
            <span>JRS / STAY INFORMED</span>
            <h2>Наукові відкриття — <em>без зайвого шуму.</em></h2>
            <p>Стежте за новими дослідженнями та редакційними оновленнями через RSS. Жодних облікових записів і поштових розсилок.</p>
          </div>
          <a href="/follow">Стежити за JRS ↗</a>
        </div>
      </section>

      <section className="contact">
        <div className="wrap contact-grid">
          <div><p className="eyebrow pale"><i /> Редакція журналу</p><h2>Поговорімо про вашу роботу.</h2></div>
          <div><p>З питань подання рукописів, редакційного розгляду та співпраці звертайтеся до редакції.</p>
            <a href="mailto:editor@kidney.pp.ua">editor@kidney.pp.ua <Arrow /></a>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap footer-top">
          <div className="brand footer-brand"><span className="logo"><b>J</b><b>R</b><b>S</b></span><span><strong>Journal of Renal Science</strong></span></div>
          <nav><a href="#about">Про журнал</a><a href="/topics">Атлас</a><a href="/publications">Публікації</a><a href="/contributors">Дослідники</a><a href="/issues">Випуски</a><a href="/reading-list">Моя бібліотека</a><a href="/submission-studio">Подання статті</a><a href="/authors">Для авторів</a><a href="/editorial-policy">Редакційна політика</a><a href="/notices">Виправлення</a><a href="/follow">Стежити за JRS</a><a href="/feed.xml" type="application/rss+xml">RSS</a><a href="#board">Редакція</a></nav>
        </div>
        <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Journal of Renal Science</span><span>Nephrology · Dialysis · Transplantation</span></div>
      </footer>
    </main>
  );
}
