import { publishAction, saveDraftAction } from "../actions";
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
      {error && <div className="jrs-admin-notice error" role="alert">
        {error === "fields" ? "Перевірте обов’язкові поля: назву, slug, анотацію, авторів і ключові слова."
          : error === "checks" ? "Перед публікацією обов’язково підтвердьте всі чотири редакційні перевірки."
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
              <label>Мова *
                <select name="language" defaultValue={article?.language || "uk"}>
                  <option value="uk">Українська</option><option value="en">Англійська</option>
                </select>
              </label>
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
          <p>Перед публікацією перевірте всі наведені умови. Ваші підтвердження будуть записані разом із датою публікації; читачі побачать матеріал лише після окремої команди.</p>
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
