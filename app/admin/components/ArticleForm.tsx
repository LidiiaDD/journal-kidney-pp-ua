import { publishAction, saveDraftAction } from "../actions";
import LanguageTranslationFields from "./LanguageTranslationFields";
import { publicationTypeLabels } from "@/app/lib/publications";
import type { PublicationType } from "@/app/lib/publications";
import type { ArticleRow } from "@/app/lib/jrs-supabase";

type Props = { article?: ArticleRow; error?: string; saved?: string; created?: string; published?: string };

const types = Object.entries(publicationTypeLabels) as [PublicationType, string][];

export default function ArticleForm({ article, error, saved, created, published }: Props) {
  const isPublished = article?.status === "published";
  const authors = article?.authors.map(author =>
    [author.name, author.affiliation || "", author.orcid || ""].join(" | ").replace(/ \|\s*$/, "")
  ).join("\n") || "";

  return (
    <div className="jrs-admin-editor">
      {error && !error.startsWith("notice-") && <div className="jrs-admin-notice error" role="alert">
        {error === "fields" ? "Перевірте назву, анотацію, авторів, ключові слова, повноту перекладу, формат DOI та відомості про рецензування."
          : error === "checks" ? "Перед публікацією обов’язково підтвердьте всі чотири редакційні перевірки."
          : error === "review" ? "Перед публікацією виберіть фактичний тип редакційного розгляду. Для незалежного рецензування заповніть його опис."
          : error === "publish" ? "Не вдалося опублікувати. Перевірте, чи заповнені всі поля і чи збережено PDF."
          : error === "pdf" ? "PDF не завантажено. Потрібен коректний PDF-файл до 3,5 МБ."
          : "Зберегти не вдалося. Перевірте унікальність slug і доступ до бази."}
      </div>}
      {(saved || created || published) && <div className="jrs-admin-notice success" role="status">
        {published ? "Статтю опубліковано в каталозі JRS."
          : created ? "Чернетку створено. Тепер можна додати PDF."
          : "Чернетку збережено."}
      </div>}
      {isPublished && (
        <div className="jrs-admin-notice success">
          Цей матеріал уже опубліковано. Щоб не змінювати наукові результати непомітно,
          редагування опублікованої версії заблоковано.
          <a href={`/publications/${article.slug}`}> Відкрити публікацію ↗</a>
        </div>
      )}
      <form action={saveDraftAction} className="jrs-admin-form">
        {article && <input type="hidden" name="id" value={article.id} />}
        <fieldset disabled={isPublished}>
          <div className="jrs-admin-fields">
            <label>Назва статті *
              <input name="title" required minLength={5} maxLength={500} defaultValue={article?.title || ""} placeholder="Точна затверджена назва матеріалу" />
            </label>
            <label>Адреса (slug) *
              <input name="slug" required pattern="[a-z0-9-]{3,100}" maxLength={100} defaultValue={article?.slug || ""} placeholder="ckd-study-2026" />
              <small>Латинські літери, цифри та дефіси. Після публікації не змінюється.</small>
            </label>
            <div className="jrs-admin-field-row">
              <label>Тип матеріалу *
                <select name="type" defaultValue={article?.type || "original-research"}>
                  {types.map(([key, label]) => <option value={key} key={key}>{label}</option>)}
                </select>
              </label>
              <LanguageTranslationFields article={article} />
            </div>
            <label>Автори *
              <textarea name="authors" rows={5} required defaultValue={authors} placeholder={"ПІБ | Установа | ORCID\nНаступний автор | Установа | ORCID"} />
              <small>Один автор на рядок. Установа та ORCID необов’язкові; не вигадуйте їх.</small>
            </label>
            <label>Анотація *
              <textarea name="abstract" rows={9} required minLength={20} maxLength={15000} defaultValue={article?.abstract || ""} placeholder="Коротко: мета, методи, результати, висновки" />
            </label>
            <label>Ключові слова *
              <textarea name="keywords" rows={3} required defaultValue={article?.keywords.join(", ") || ""} placeholder="Хронічна хвороба нирок, біомаркери, діаліз" />
              <small>Розділяйте комами або крапкою з комою.</small>
            </label>
            <div className="jrs-meta-editor-intro">
              <h3>Бібліографічні відомості</h3>
              <p>Заповнюйте лише фактично присвоєні значення. DOI має бути зареєстрований; журнал його не створює автоматично.</p>
            </div>
            <div className="jrs-admin-field-row">
              <label>Том (якщо існує)
                <input name="volume" maxLength={35} defaultValue={article?.volume || ""} placeholder="Наприклад, 1" />
              </label>
              <label>Випуск (якщо існує)
                <input name="issue" maxLength={35} defaultValue={article?.issue || ""} placeholder="Наприклад, 1" />
              </label>
              <label>Сторінки або номер статті
                <input name="pages" maxLength={60} defaultValue={article?.pages || ""} placeholder="Наприклад, 12–19" />
              </label>
              <label>Зареєстрований DOI
                <input name="doi" maxLength={180} defaultValue={article?.doi || ""} placeholder="10.xxxx/xxxxx" />
              </label>
            </div>
            <label>Список літератури
              <textarea name="references_list" rows={8} defaultValue={article?.references_list?.join("\n") || ""} placeholder={"Один перевірений бібліографічний запис на рядок\nНаступне джерело з нового рядка"} />
              <small>Один запис на рядок, до 150 джерел. Посилання не генеруються автоматично.</small>
            </label>
            <section className="jrs-transparency-editor" aria-labelledby="jrs-transparency-title">
              <div className="jrs-transparency-intro">
                <span>JRS / RESEARCH INTEGRITY</span>
                <h3 id="jrs-transparency-title">Паспорт наукової прозорості</h3>
                <p>Ці відомості читач побачить біля статті. Вносіть лише документально перевірені заяви авторів і фактичні редакційні рішення. Відсутність інформації буде прямо позначена як «Не зазначено».</p>
              </div>
              <label>Фактичний тип редакційного розгляду (обов’язково перед публікацією)
                <select name="review_kind" defaultValue={article?.review_kind || ""}>
                  <option value="">Ще не визначено — тільки для чернетки</option>
                  <option value="editorial">Редакційний розгляд (без заяви про незалежне рецензування)</option>
                  <option value="external">Незалежне зовнішнє рецензування — фактично проведене</option>
                </select>
                <small>Не позначайте «зовнішнє рецензування» лише за перевірку самим редактором або програмою.</small>
              </label>
              <label>Що фактично відбувалося під час розгляду
                <textarea name="review_details" rows={3} maxLength={2000}
                  defaultValue={article?.review_details || ""}
                  placeholder="Наприклад, опис редакційного розгляду або підтвердженого зовнішнього рецензування" />
                <small>Для незалежного зовнішнього рецензування потрібен опис від 20 символів. Не вказуйте конфіденційні персональні дані рецензентів без дозволу.</small>
              </label>
              <div className="jrs-transparency-grid">
                <label>Етичне схвалення або обґрунтування незастосовності
                  <textarea name="ethics_statement" rows={4} maxLength={3500}
                    defaultValue={article?.ethics_statement || ""}
                    placeholder="Назва комісії, рішення й дата — лише якщо достовірно відомі. Для інших робіт поясніть незастосовність." />
                </label>
                <label>Інформована згода та згода на публікацію
                  <textarea name="consent_statement" rows={4} maxLength={3500}
                    defaultValue={article?.consent_statement || ""}
                    placeholder="Фактична інформація про згоду, коли це застосовно." />
                </label>
                <label>Фінансування
                  <textarea name="funding_statement" rows={3} maxLength={3500}
                    defaultValue={article?.funding_statement || ""}
                    placeholder="Вкажіть реального фінансувальника або підтверджену відсутність зовнішнього фінансування." />
                </label>
                <label>Конфлікти інтересів
                  <textarea name="competing_interests" rows={3} maxLength={3500}
                    defaultValue={article?.competing_interests || ""}
                    placeholder="Фактично надана декларація авторів." />
                </label>
                <label>Доступність дослідницьких даних
                  <textarea name="data_availability" rows={3} maxLength={3500}
                    defaultValue={article?.data_availability || ""}
                    placeholder="Де й на яких умовах доступні дані; не обіцяйте відкритого доступу до персональних даних." />
                </label>
                <label>Внесок авторів
                  <textarea name="author_contributions" rows={3} maxLength={3500}
                    defaultValue={article?.author_contributions || ""}
                    placeholder="Наприклад, концепція, аналіз, збір даних, написання — лише реальний внесок." />
                </label>
                <label>Використання ШІ
                  <textarea name="ai_disclosure" rows={3} maxLength={3500}
                    defaultValue={article?.ai_disclosure || ""}
                    placeholder="Інструменти та їх роль або підтверджена авторами відсутність використання." />
                </label>
              </div>
              <p className="jrs-transparency-reminder">Усі зміни потрібно зберегти в чернетці до натискання «Опублікувати». Цей блок не виконує автоматичної етичної експертизи чи перевірки фактів.</p>
            </section>
          </div>
        </fieldset>
        {!isPublished && (
          <button type="submit" className="jrs-admin-primary">
            {article ? "Зберегти чернетку" : "Створити чернетку"}
          </button>
        )}
      </form>

      {article && (
        <div className="jrs-admin-preview-link">
          <div>
            <strong>Перегляд статті перед публікацією</strong>
            <p>Відкривається лише для редактора. Якщо ви щойно змінили текст — спочатку збережіть чернетку.</p>
          </div>
          <a href={`/admin/articles/${article.id}/preview`} target="_blank" rel="noopener noreferrer">Переглянути оформлення ↗</a>
        </div>
      )}

      {article && (
        <section className="jrs-admin-pdf">
          <h2>Повний текст PDF</h2>
          {article.pdf_path ? (
            <p>PDF додано. <a href={`/admin/articles/${article.id}/pdf`} target="_blank" rel="noopener noreferrer">Переглянути файл ↗</a></p>
          ) : (
            <p>Файл ще не додано. Публікація без PDF можлива, але рекомендовано надати повний текст.</p>
          )}
          {!isPublished && (
            <form method="post" action={`/admin/articles/${article.id}/pdf`} encType="multipart/form-data">
              <label>Виберіть перевірений, знеособлений PDF (до 3,5 МБ)
                <input type="file" name="pdf" accept="application/pdf,.pdf" required />
              </label>
              <button type="submit">{article.pdf_path ? "Замінити PDF у чернетці" : "Завантажити PDF"}</button>
            </form>
          )}
        </section>
      )}

      {article && !isPublished && (
        <section className="jrs-admin-publish">
          <h2>Оприлюднення</h2>
          <p>Перед публікацією збережіть паспорт прозорості, виберіть фактичний тип розгляду та перевірте всі наведені умови. Ваші підтвердження будуть записані разом із датою публікації; читачі побачать матеріал лише після окремої команди.</p>
          <form action={publishAction} className="jrs-publish-checklist">
            <input type="hidden" name="id" value={article.id} />
            <label><input type="checkbox" name="check_authors" value="yes" required /> Усі автори погодили фінальний текст і його оприлюднення.</label>
            <label><input type="checkbox" name="check_ethics" value="yes" required /> Етичні дозволи та інформована згода перевірені настільки, наскільки це застосовно до цього типу роботи.</label>
            <label><input type="checkbox" name="check_privacy" value="yes" required /> У статті й PDF немає персональних даних пацієнтів без належної правової підстави.</label>
            <label><input type="checkbox" name="check_accuracy" value="yes" required /> Назва, автори, анотація, результати, ключові слова та прикріплений PDF перевірені.</label>
            <button type="submit" className="jrs-admin-publish-button">Підтвердити та опублікувати</button>
          </form>
        </section>
      )}
    </div>
  );
}
