"use client";

import { useMemo, useState } from "react";
import { manuscriptGuides, type ManuscriptKind } from "@/app/lib/manuscript-guide";

const editorialEmail = "editor@kidney.pp.ua";

type LetterFields = {
  title: string;
  author: string;
  email: string;
  affiliation: string;
  contribution: string;
  note: string;
};

const attachments = [
  { id: "manuscript", title: "Файл рукопису (DOCX)", detail: "Фінальний текст із таблицями або посиланнями на них" },
  { id: "figures", title: "Рисунки й додаткові матеріали", detail: "Окремі файли за наявності; не додавайте неанонімізовані дані" },
  { id: "declarations", title: "Декларації та дозволи", detail: "Авторство, етика, конфлікти інтересів, фінансування, використання ШІ" },
  { id: "contact", title: "Контакт відповідального автора", detail: "Адреса для листування й актуальна афіліація" },
] as const;

const initialFields: LetterFields = {
  title: "",
  author: "",
  email: "",
  affiliation: "",
  contribution: "",
  note: "",
};

function trimmed(value: string) { return value.replace(/[\r\n]+/g, " ").trim(); }

export default function SubmissionStudio() {
  const [kind, setKind] = useState<ManuscriptKind>("observational");
  const [fields, setFields] = useState<LetterFields>(initialFields);
  const [prepared, setPrepared] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const typeLabel = manuscriptGuides.find(guide => guide.id === kind)?.label ?? "Науковий матеріал";

  const update = (name: keyof LetterFields, value: string) => {
    setFields(current => ({ ...current, [name]: value }));
    setMessage("");
  };

  const title = trimmed(fields.title);
  const author = trimmed(fields.author);
  const contribution = fields.contribution.trim();
  const ready = title.length >= 5 && author.length >= 3 && contribution.length >= 15;
  const completed = attachments.filter(file => prepared[file.id]).length;

  const subject = `JRS — подання рукопису: ${title || "назва роботи"}`;
  const letter = useMemo(() => {
    const titleText = trimmed(fields.title) || "[Назва рукопису]";
    const authorText = trimmed(fields.author) || "[ПІБ відповідального автора]";
    const novelty = fields.contribution.trim() || "[Коротко опишіть наукову новизну чи практичне значення]";
    const affiliation = trimmed(fields.affiliation);
    const contact = trimmed(fields.email);
    const comments = fields.note.trim();
    return [
      "Шановна редакціє Journal of Renal Science!",
      "",
      `Прошу розглянути для публікації рукопис «${titleText}» (${typeLabel.toLowerCase()}).`,
      "",
      "Наукова та/або практична цінність роботи:",
      novelty,
      "",
      "Рукопис та необхідні супровідні матеріали додаються окремими файлами до листа.",
      "",
      ...(comments ? ["Додаткова інформація для редакції:", comments, ""] : []),
      "З повагою,",
      authorText,
      ...(affiliation ? [affiliation] : []),
      ...(contact ? [contact] : []),
    ].join("\n");
  }, [fields, typeLabel]);

  // Mail clients have different URL-length limits; keep the encoded draft compact.
  // The full text always remains available to copy without truncation.
  const mailBody = letter.length <= 1400 ? letter : [
    "Шановна редакціє Journal of Renal Science!",
    "",
    `Прошу розглянути рукопис «${title.slice(0, 170)}» (${typeLabel}).`,
    "Повний супровідний текст підготовлено окремо та буде додано до листа.",
    "",
    `З повагою, ${author.slice(0, 100)}`,
  ].join("\n");
  const mailto = `mailto:${editorialEmail}?subject=${encodeURIComponent(subject.slice(0, 230))}&body=${encodeURIComponent(mailBody)}`;

  async function copyLetter() {
    if (!ready) {
      setMessage("Спочатку введіть назву, ім’я автора та коротку цінність роботи.");
      return;
    }
    try {
      await navigator.clipboard.writeText(`Тема: ${subject}\n\n${letter}`);
      setMessage("Супровідний лист скопійовано. Додайте файли до листа вручну.");
    } catch {
      setMessage("Копіювання недоступне. Виділіть текст у попередньому перегляді.");
    }
  }

  return (
    <div className="submission-studio">
      <div className="submission-top">
        <div>
          <span className="submission-kicker">JRS / AUTHOR DESK</span>
          <h2>Від рукопису — до першого листа редакції.</h2>
          <p>Заповніть кілька полів: майстер підготує супровідний лист із вашими формулюваннями. Жоден текст не надсилається автоматично.</p>
        </div>
        <div className="submission-private">
          <span aria-hidden="true">✳</span>
          <strong>Безпечно для чернетки</strong>
          <p>Текст обробляється тільки на цій сторінці. Ми не зберігаємо його на сервері; після закриття сторінки незбережені поля можуть зникнути.</p>
        </div>
      </div>

      <div className="submission-columns">
        <section className="submission-editor" aria-labelledby="submission-form-title">
          <div className="submission-section-heading">
            <span>01</span>
            <div>
              <h3 id="submission-form-title">Відомості про матеріал</h3>
              <p>Дані будуть використані лише для складання тексту листа.</p>
            </div>
          </div>

          <div className="submission-fields">
            <label>Тип матеріалу
              <select value={kind} onChange={event => { setKind(event.target.value as ManuscriptKind); setMessage(""); }}>
                {manuscriptGuides.map(guide => <option key={guide.id} value={guide.id}>{guide.label}</option>)}
              </select>
            </label>
            <label>Назва рукопису <span>*</span>
              <textarea rows={2} maxLength={220} value={fields.title}
                onChange={event => update("title", event.target.value)}
                placeholder="Вкажіть точну назву вашого дослідження" />
            </label>
            <label>Відповідальний автор <span>*</span>
              <input maxLength={150} value={fields.author}
                onChange={event => update("author", event.target.value)}
                placeholder="ПІБ автора для листування" />
            </label>
            <div className="submission-two">
              <label>Електронна адреса автора
                <input type="email" maxLength={180} value={fields.email}
                  onChange={event => update("email", event.target.value)}
                  placeholder="author@example.com" />
              </label>
              <label>Афіліація / установа
                <input maxLength={180} value={fields.affiliation}
                  onChange={event => update("affiliation", event.target.value)}
                  placeholder="Назва установи, місто" />
              </label>
            </div>
            <label>Наукова новизна або практична цінність <span>*</span>
              <textarea rows={5} maxLength={850} value={fields.contribution}
                onChange={event => update("contribution", event.target.value)}
                placeholder="2–4 речення своїми словами: що досліджували, чому це важливо, який внесок робить робота" />
              <small>Майстер не вигадує результати чи наукові твердження. Опишіть їх самостійно.</small>
            </label>
            <label>Додаткова інформація (необов’язково)
              <textarea rows={3} maxLength={450} value={fields.note}
                onChange={event => update("note", event.target.value)}
                placeholder="Наприклад, інформація про препринт або пов’язані публікації" />
            </label>
          </div>
        </section>

        <section className="submission-preview" aria-labelledby="submission-preview-title">
          <div className="submission-preview-top">
            <span>LIVE LETTER PREVIEW</span>
            <span className="submission-preview-logo">JRS</span>
          </div>
          <h3 id="submission-preview-title">Супровідний лист</h3>
          <p className="submission-subject"><strong>Тема:</strong> {subject}</p>
          <pre className="submission-letter">{letter}</pre>
          <p className="submission-preview-tip">Перед надсиланням перевірте точність відомостей, згоду співавторів та комплектність вкладень.</p>
        </section>
      </div>

      <section className="submission-files" aria-labelledby="submission-files-title">
        <div className="submission-section-heading">
          <span>02</span>
          <div>
            <h3 id="submission-files-title">Перевірте вкладення</h3>
            <p>Ці позначки — тільки для вас. Частина файлів потрібна лише за наявності відповідних матеріалів.</p>
          </div>
        </div>
        <div className="submission-file-grid">
          {attachments.map(file => (
            <label className={`submission-file${prepared[file.id] ? " is-checked" : ""}`} key={file.id}>
              <input type="checkbox" checked={Boolean(prepared[file.id])}
                onChange={event => setPrepared(current => ({ ...current, [file.id]: event.target.checked }))} />
              <span aria-hidden="true" className="submission-file-mark">{prepared[file.id] ? "✓" : ""}</span>
              <span><strong>{file.title}</strong><small>{file.detail}</small></span>
            </label>
          ))}
        </div>
        <p className="submission-file-count">{completed} з {attachments.length} пунктів позначено. Це не автоматична перевірка документів.</p>
      </section>

      <section className="submission-send" aria-labelledby="submission-send-title">
        <div>
          <span className="submission-kicker">03 / READY TO SUBMIT</span>
          <h2 id="submission-send-title">Ваш лист готовий до відправлення?</h2>
          <p>Перевірте текст і додайте DOCX, ілюстрації та декларації у власній поштовій програмі. Редакція отримує матеріали лише тоді, коли ви самі надішлете лист.</p>
          {!ready && <p className="submission-needed">Для завершення заповніть назву (від 5 символів), ім’я автора (від 3) і опис цінності роботи (від 15).</p>}
        </div>
        <div className="submission-actions">
          <button type="button" disabled={!ready} onClick={() => void copyLetter()}>
            Копіювати лист
          </button>
          <a className={ready ? "" : "is-disabled"} aria-disabled={!ready} tabIndex={ready ? 0 : -1}
            href={ready ? mailto : undefined}
            onClick={event => { if (!ready) event.preventDefault(); else setMessage("Перевірте лист у поштовій програмі та прикріпіть файли вручну."); }}>
            Відкрити пошту ↗
          </a>
        </div>
        <p className="submission-feedback" role="status" aria-live="polite">{message}</p>
        {ready && letter.length > 1400 && <p className="submission-mail-warning">Через обмеження поштових програм при відкритті пошти буде використаний скорочений текст. Скопіюйте повний лист окремо, якщо хочете надіслати його цілком.</p>}
      </section>
      <p className="submission-last-note">Майстер допомагає з оформленням звернення, але не підтверджує якість, етичне схвалення чи прийняття статті. Не вводьте персональні дані пацієнтів, результати з ідентифікаторами або неопубліковані конфіденційні матеріали.</p>
    </div>
  );
}
