"use client";

import { useState } from "react";

type Kind = "original" | "review" | "systematic" | "case" | "brief" | "discussion";
type ChecklistItem = { id: string; text: string };
type ManuscriptType = {
  id: Kind;
  code: string;
  title: string;
  description: string;
  methodNote: string;
  specific: ChecklistItem[];
};

const sharedItems: ChecklistItem[] = [
  { id: "file", text: "Підготовлено читабельний файл рукопису .docx." },
  { id: "author", text: "Вказані назва, автори, установи, контактний автор та адреса для листування." },
  { id: "abstract", text: "Додані анотація та 3–6 ключових слів, якщо вони застосовні до формату." },
  { id: "references", text: "Джерела оформлені послідовно; DOI та URL наведені за наявності." },
  { id: "figures", text: "Таблиці, рисунки, підписи й одиниці вимірювання перевірені; файли ілюстрацій додані за потреби." },
  { id: "coauthors", text: "Усі співавтори погодили фінальну версію та подання роботи." },
  { id: "ethics", text: "Описані етичне схвалення / обґрунтована відсутність потреби в ньому та інформована згода, де це застосовно." },
  { id: "privacy", text: "Із тексту та вкладень вилучені ідентифікаційні дані пацієнтів; на впізнавані матеріали є належна згода на публікацію." },
  { id: "declarations", text: "Зазначені конфлікти інтересів, фінансування та внески авторів." },
  { id: "ai", text: "Розкрито використання генеративного ШІ або прямо зазначено, що його не використовували." },
  { id: "originality", text: "Перевірені оригінальність, коректність цитувань та відомості про препринти чи попередні публікації." },
];

const manuscriptTypes: ManuscriptType[] = [
  {
    id: "original", code: "01", title: "Оригінальне дослідження",
    description: "Клінічне, обсерваційне, експериментальне чи лабораторне дослідження з власними даними.",
    methodNote: "Для обсерваційних робіт орієнтиром є STROBE; для інших дизайнів доберіть відповідний стандарт звітності.",
    specific: [
      { id: "design", text: "Зазначені мета, дизайн, часові межі, вибірка, критерії включення й виключення." },
      { id: "statistics", text: "Описані методи вимірювань, статистичний аналіз і робота з відсутніми даними." },
      { id: "results", text: "Наведені кількісні результати та, де потрібно, довірчі інтервали; числа узгоджені з таблицями." },
      { id: "limits", text: "Обговорені обмеження дослідження, а висновки не виходять за межі дизайну." },
    ],
  },
  {
    id: "review", code: "02", title: "Оглядова стаття",
    description: "Критичний, структурований аналіз сучасної літератури без заяви про систематичний пошук.",
    methodNote: "Описуйте принцип добору джерел прозоро; не називайте огляд систематичним без відповідної методології.",
    specific: [
      { id: "question", text: "Сформульовані мета огляду, межі теми й клінічне значення." },
      { id: "selection", text: "Описані підхід до пошуку та принципи добору джерел." },
      { id: "synthesis", text: "Відокремлені результати досліджень, інтерпретації та нерозв’язані питання." },
    ],
  },
  {
    id: "systematic", code: "03", title: "Систематичний огляд",
    description: "Систематичний огляд літератури, із метааналізом або без нього.",
    methodNote: "Звірте структуру й повноту звітності з PRISMA 2020; протокол/реєстрацію зазначте, якщо вони є.",
    specific: [
      { id: "protocol", text: "Сформульовані дослідницьке питання, критерії включення й відомості про протокол або його відсутність." },
      { id: "search", text: "Описані бази даних, дати, стратегія пошуку та відбір публікацій." },
      { id: "bias", text: "Подані оцінка ризику упередженості та спосіб синтезу результатів." },
      { id: "prisma", text: "Підготовлені блок-схема відбору й релевантні пункти PRISMA 2020." },
    ],
  },
  {
    id: "case", code: "04", title: "Клінічний випадок / серія",
    description: "Клінічне спостереження або серія випадків із навчальною та практичною цінністю.",
    methodNote: "Для опису окремого клінічного випадку корисний чекліст CARE. Згода на публікацію потрібна, коли пацієнта можна ідентифікувати.",
    specific: [
      { id: "timeline", text: "Послідовно описані анамнез, часовий перебіг, діагностика, лікування й наслідки." },
      { id: "discussion", text: "Розкриті диференційна діагностика, клінічне рішення та урок для практики." },
      { id: "case-privacy", text: "Перевірена неможливість ідентифікувати пацієнта за текстом, датами, знімками та метаданими." },
      { id: "care", text: "Для окремого випадку перевірена відповідність релевантним пунктам CARE." },
    ],
  },
  {
    id: "brief", code: "05", title: "Коротке повідомлення",
    description: "Попередні результати або компактне дослідження з чітко визначеною сферою висновків.",
    methodNote: "Стислість не скасовує вимог до методології, перевірюваності результатів і наукової доброчесності.",
    specific: [
      { id: "purpose", text: "Чітко визначені запитання, вибірка та метод отримання даних." },
      { id: "keyresults", text: "Наведені головні числові результати й лише обґрунтовані висновки." },
      { id: "prelim", text: "Попередній характер даних і обмеження позначені прямо." },
    ],
  },
  {
    id: "discussion", code: "06", title: "Аналітичний матеріал",
    description: "Аргументована дискусія, клінічний коментар або позиційна стаття.",
    methodNote: "Чітко відокремлюйте авторську оцінку від перевірених наукових фактів.",
    specific: [
      { id: "thesis", text: "Є чітка теза та зрозуміле практичне або наукове питання." },
      { id: "facts", text: "Твердження підкріплені належними джерелами, а дискусійні судження позначені як позиція автора." },
      { id: "balance", text: "Розглянуті альтернативні пояснення та межі аргументації." },
    ],
  },
];

export default function ManuscriptNavigator() {
  const [kind, setKind] = useState<Kind>("original");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const selected = manuscriptTypes.find((entry) => entry.id === kind) ?? manuscriptTypes[0];
  const items = [...sharedItems, ...selected.specific];
  const done = items.filter((item) => completed[item.id]).length;
  const percentage = Math.round((done / items.length) * 100);
  const ready = done === items.length;

  function chooseKind(nextKind: Kind) {
    if (nextKind !== kind) {
      setKind(nextKind);
      setCompleted({});
    }
  }

  return (
    <div className="mn">
      <div className="mn-intro">
        <span className="mn-overline">JRS · AUTHOR WORKSPACE</span>
        <p>Це приватна самоперевірка у вашому браузері: відповіді не надсилаються редакції та не зберігаються на сервері. Зміна типу матеріалу або оновлення сторінки скидає позначки.</p>
      </div>

      <section className="mn-section" aria-labelledby="mn-type-title">
        <div className="mn-section-heading">
          <span className="mn-step">01 / Тип матеріалу</span>
          <h2 id="mn-type-title">Що ви плануєте подати?</h2>
          <p>Виберіть один формат, щоб отримати відповідні методологічні вимоги.</p>
        </div>
        <div className="mn-type-grid" role="group" aria-label="Тип рукопису">
          {manuscriptTypes.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={"mn-type" + (kind === entry.id ? " mn-type-active" : "")}
              aria-pressed={kind === entry.id}
              onClick={() => chooseKind(entry.id)}
            >
              <span className="mn-type-top"><span>JRS / {entry.code}</span><span aria-hidden="true">{kind === entry.id ? "●" : "↗"}</span></span>
              <strong>{entry.title}</strong>
              <span className="mn-type-description">{entry.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mn-section" aria-labelledby="mn-check-title">
        <div className="mn-section-heading">
          <span className="mn-step">02 / Самоперевірка</span>
          <h2 id="mn-check-title">Чекліст рукопису</h2>
          <p>Позначайте лише ті пункти, які фактично виконані. Пункти щодо згоди й етичного схвалення враховуйте залежно від типу та умов дослідження.</p>
        </div>
        <div className="mn-guidance">
          <span>МЕТОДОЛОГІЧНИЙ ОРІЄНТИР · {selected.title}</span>
          <p>{selected.methodNote}</p>
          <a href="/authors#reporting">Вимоги журналу ↗</a>
        </div>
        <div className="mn-progress" aria-label="Поточний стан підготовки">
          <div className="mn-progress-summary">
            <div><span>САМОСТІЙНА ОЦІНКА ГОТОВНОСТІ</span><strong aria-live="polite">{percentage}%</strong></div>
            <p aria-live="polite">{done} із {items.length} пунктів виконано</p>
          </div>
          <progress max={items.length} value={done} aria-label="Виконані пункти чекліста" />
          <p className="mn-progress-footnote">{ready ? "Усі пункти позначено. Перевірте вкладення та правила журналу перед надсиланням." : "Оберіть і відмітьте виконані пункти; показник зміниться автоматично."}</p>
        </div>

        <div className="mn-list-heading"><h3>Загальні вимоги</h3><span>{sharedItems.length} пунктів</span></div>
        <div className="mn-check-list">
          {sharedItems.map((item) => (
            <label key={item.id} className={"mn-check" + (completed[item.id] ? " mn-check-done" : "")}>
              <input
                type="checkbox"
                checked={Boolean(completed[item.id])}
                onChange={(event) => setCompleted((old) => ({ ...old, [item.id]: event.target.checked }))}
              />
              <span>{item.text}</span>
            </label>
          ))}
        </div>
        <div className="mn-list-heading"><h3>Для вибраного формату</h3><span>{selected.specific.length} пунктів</span></div>
        <div className="mn-check-list">
          {selected.specific.map((item) => (
            <label key={item.id} className={"mn-check" + (completed[item.id] ? " mn-check-done" : "")}>
              <input
                type="checkbox"
                checked={Boolean(completed[item.id])}
                onChange={(event) => setCompleted((old) => ({ ...old, [item.id]: event.target.checked }))}
              />
              <span>{item.text}</span>
            </label>
          ))}
        </div>
        <div className="mn-check-actions">
          <button type="button" className="mn-reset" onClick={() => setCompleted({})}>Скинути позначки</button>
          <a href="/authors#submission">Докладні правила подання ↗</a>
        </div>
      </section>

      <section className="mn-submit" aria-labelledby="mn-submit-title">
        <div>
          <span className="mn-overline">03 / Подання</span>
          <h2 id="mn-submit-title">{ready ? "Готові перейти до подання?" : "Після перевірки — надішліть рукопис."}</h2>
          <p>Індикатор відображає лише ваші позначки, а не перевірку редакції, наукове схвалення чи гарантію прийняття статті. Під час подання не додавайте до листа персональні дані пацієнтів.</p>
        </div>
        <a href="mailto:editor@kidney.pp.ua?subject=JRS%20%E2%80%94%20%D0%BF%D0%BE%D0%B4%D0%B0%D0%BD%D0%BD%D1%8F%20%D1%80%D1%83%D0%BA%D0%BE%D0%BF%D0%B8%D1%81%D1%83">Написати редакції ↗</a>
      </section>
    </div>
  );
}
