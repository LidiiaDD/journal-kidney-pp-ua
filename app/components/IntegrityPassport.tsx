import type { ArticleTransparency } from "@/app/lib/publications";

type Props = { record?: ArticleTransparency; draft?: boolean };

const declarations: { label: string; key: keyof ArticleTransparency; note: string }[] = [
  {
    label: "Етичне схвалення",
    key: "ethicsStatement",
    note: "Комісія з етики або обґрунтування незастосовності",
  },
  {
    label: "Інформована згода",
    key: "consentStatement",
    note: "У тому числі згода на публікацію за потреби",
  },
  {
    label: "Фінансування",
    key: "fundingStatement",
    note: "Джерела підтримки, зазначені авторами",
  },
  {
    label: "Конфлікти інтересів",
    key: "competingInterests",
    note: "Фінансові й нефінансові інтереси",
  },
  {
    label: "Доступність даних",
    key: "dataAvailability",
    note: "Місце та умови доступу, якщо їх заявлено",
  },
  {
    label: "Внесок авторів",
    key: "authorContributions",
    note: "Опис фактичної участі",
  },
  {
    label: "Використання ШІ",
    key: "aiDisclosure",
    note: "Декларація інструментів і їх ролі",
  },
];

export default function IntegrityPassport({ record, draft = false }: Props) {
  const kind = record?.reviewKind;
  const reviewLabel = kind === "external"
    ? "Зовнішнє незалежне рецензування"
    : kind === "editorial"
      ? "Редакційний розгляд"
      : "Тип розгляду не зазначено";

  const reviewExplanation = kind === "external"
    ? "Редакція зазначила, що зовнішнє рецензування відбулося. Нижче має бути фактичний опис процедури."
    : kind === "editorial"
      ? "Редакційна оцінка не прирівнюється до незалежного зовнішнього рецензування."
      : "Відомості про редакційний процес для цього матеріалу не надано.";

  const completed = declarations.filter(item => {
    const value = record?.[item.key];
    return typeof value === "string" && value.trim().length > 0;
  }).length;

  return (
    <section className="jrs-integrity-passport" id="transparency" aria-labelledby="jrs-passport-title">
      <div className="jrs-passport-head">
        <div>
          <span className="jrs-passport-overline">JRS / RESEARCH INTEGRITY</span>
          <h2 id="jrs-passport-title">Паспорт наукової прозорості</h2>
          <p>Редакційні відомості та декларації авторів, пов’язані з цією публікацією.</p>
        </div>
        <div className="jrs-passport-symbol" aria-hidden="true"><span>J</span><span>R</span><span>S</span></div>
      </div>

      {draft && (
        <div className="jrs-passport-draft">
          Це приватний перегляд. Декларації не оприлюднені й можуть бути відкориговані до публікації.
        </div>
      )}

      <div className="jrs-passport-review">
        <div className="jrs-passport-review-badge">
          <span>ТИП РОЗГЛЯДУ</span>
          <strong>{reviewLabel}</strong>
        </div>
        <div>
          <p>{reviewExplanation}</p>
          {record?.reviewDetails?.trim()
            ? <p className="jrs-passport-review-details">{record.reviewDetails}</p>
            : <p className="jrs-passport-review-missing">Деталі розгляду не зазначено.</p>}
        </div>
      </div>

      <div className="jrs-passport-columns">
        {declarations.map(item => {
          const value = record?.[item.key];
          const statement = typeof value === "string" ? value.trim() : "";
          return (
            <div className="jrs-passport-item" key={item.key}>
              <span className="jrs-passport-item-label">{item.label}</span>
              <small>{item.note}</small>
              {statement
                ? <p className="jrs-passport-statement">{statement}</p>
                : <p className="jrs-passport-unknown">Не зазначено</p>}
            </div>
          );
        })}
      </div>

      <div className="jrs-passport-foot">
        <span><strong>{completed}</strong> / {declarations.length} декларацій мають текст</span>
        <p>Наявність декларації — це прозорість звітування, а не підтвердження наукової якості чи дотримання всіх вимог. Позначка «Не зазначено» не означає «відсутнє» або «не застосовується». Дані відображають внесені редакцією відомості на підставі заяв авторів.</p>
      </div>
    </section>
  );
}
