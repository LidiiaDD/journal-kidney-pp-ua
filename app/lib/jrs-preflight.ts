import type { ArticleRow } from "./jrs-supabase";

export type AuditStatus = "filled" | "attention" | "optional";
export type AuditItem = {
  id: string;
  label: string;
  detail: string;
  status: AuditStatus;
};

export type AuditSection = {
  id: string;
  title: string;
  summary: string;
  items: AuditItem[];
};

const filled = (value: string | null | undefined) => Boolean(value?.trim());

/**
 * ORCID uses ISO 7064 MOD 11-2. A valid check digit checks transcription only:
 * it does NOT verify identity or that an ORCID exists in the registry.
 */
export function hasValidOrcidCheckDigit(id: string): boolean {
  if (!/^\d{4}-\d{4}-\d{4}-[\dX]{4}$/.test(id)) return false;
  const compact = id.replace(/-/g, "");
  let total = 0;
  for (const digit of compact.slice(0, 15)) {
    total = (total + Number(digit)) * 2;
  }
  const check = (12 - (total % 11)) % 11;
  return compact.at(-1) === (check === 10 ? "X" : String(check));
}

function item(id: string, label: string, detail: string, status: AuditStatus): AuditItem {
  return { id, label, detail, status };
}

/**
 * Read-only prepublication inventory from a SAVED article.
 * No patient content is transmitted to external services and no editorial
 * declaration is inferred to be true merely because its text is populated.
 */
export function auditSavedArticle(article: ArticleRow): AuditSection[] {
  const authors = Array.isArray(article.authors) ? article.authors : [];
  const keywords = Array.isArray(article.keywords) ? article.keywords : [];
  const authorNamesPresent = authors.length > 0 && authors.every(author => filled(author.name));
  const invalidOrcids = authors.filter(author => author.orcid && !hasValidOrcidCheckDigit(author.orcid));
  const alternate = article.language === "uk" ? "en" : "uk";
  const altTitle = alternate === "uk" ? article.title_uk : article.title_en;
  const altAbstract = alternate === "uk" ? article.abstract_uk : article.abstract_en;
  const altKeywords = alternate === "uk" ? article.keywords_uk : article.keywords_en;
  const translationItems = [filled(altTitle), filled(altAbstract), Boolean(altKeywords?.length)];
  const translatedCount = translationItems.filter(Boolean).length;
  const completeTranslation = translatedCount === 3;
  const volumePresent = filled(article.volume);
  const issuePresent = filled(article.issue);
  const validReview = article.review_kind === "editorial" || article.review_kind === "external";
  const adequateExternal = article.review_kind !== "external" ||
    (article.review_details?.trim().length ?? 0) >= 20;
  const references = Array.isArray(article.references_list) ? article.references_list : [];
  const doi = article.doi?.trim() ?? "";
  const doiSyntaxOk = !doi || /^10[.]\d{4,9}\/\S+$/.test(doi);

  const essentials: AuditItem[] = [
    item("title", "Назва статті", filled(article.title) && article.title.trim().length >= 5
      ? "Назву внесено. Звірте її з фінальною версією рукопису." : "Потрібна повна затверджена назва (щонайменше 5 символів).",
      filled(article.title) && article.title.trim().length >= 5 ? "filled" : "attention"),
    item("slug", "Постійна адреса (slug)", /^[a-z0-9-]{3,100}$/.test(article.slug)
      ? "Формат адреси допустимий. Після публікації змінювати її не варто." : "Перевірте формат адреси: латиниця, цифри та дефіс.",
      /^[a-z0-9-]{3,100}$/.test(article.slug) ? "filled" : "attention"),
    item("abstract", "Анотація", filled(article.abstract) && article.abstract.trim().length >= 20
      ? "Анотацію внесено. Відповідність даним і висновкам перевіряє редактор." : "Анотацію не внесено або вона надто коротка.",
      filled(article.abstract) && article.abstract.trim().length >= 20 ? "filled" : "attention"),
    item("authors", "Авторський склад", authorNamesPresent
      ? `Внесено авторів: ${authors.length}. Підтвердження їхнього внеску та згоди залишається ручним.`
      : "Необхідно вказати щонайменше одного автора й перевірити повноту імен.",
      authorNamesPresent ? "filled" : "attention"),
    item("keywords", "Ключові слова", keywords.some(word => word.trim())
      ? `Внесено ключових слів: ${keywords.length}. Перевірте точність термінів.`
      : "Додайте перевірені ключові слова.",
      keywords.some(word => word.trim()) ? "filled" : "attention"),
    item("review", "Тип редакційного розгляду", validReview && adequateExternal
      ? article.review_kind === "editorial"
        ? "Вибрано редакційний розгляд. Це не заява про зовнішнє рецензування."
        : "Заявлено зовнішнє рецензування й внесено опис. Факт проведення потрібно документально підтвердити."
      : "Потрібно вибрати фактичний тип розгляду; зовнішнє рецензування вимагає опису щонайменше 20 символів.",
      validReview && adequateExternal ? "filled" : "attention"),
  ];

  const additional: AuditItem[] = [
    item("orcid", "Перевірка контрольних цифр ORCID", invalidOrcids.length
      ? `У ${invalidOrcids.length} автора(ів) контрольна цифра ORCID не збігається. Перевірте записи.`
      : authors.some(author => author.orcid)
        ? "Контрольні цифри внесених ORCID відповідають формату; приналежність авторам не перевірялась."
        : "ORCID не зазначено. Це необов’язкове поле.",
      invalidOrcids.length ? "attention" : "optional"),
    item("translation", "Метадані другою мовою", translatedCount === 0
      ? "Переклад відсутній — це допустимо. Якщо додавати, назва, анотація і ключові слова потрібні разом."
      : completeTranslation
        ? "Усі три компоненти перекладу є. Їхня мовна та наукова точність потребує перевірки."
        : "Переклад неповний. Заповніть назву, анотацію та ключові слова або приберіть часткові відомості.",
      translatedCount > 0 && !completeTranslation ? "attention" : "optional"),
    item("references", "Бібліографічні джерела", references.length
      ? `Внесено ${references.length} бібліографічних записів. Перевірте точність та права на матеріали.`
      : "Список джерел не внесено. Перевірте, чи доречна його відсутність для цього типу матеріалу.",
      references.length ? "filled" : "attention"),
    item("pdf", "Повний текст PDF", filled(article.pdf_path)
      ? "Файл збережено приватно. Знеособлення, повноту та відповідність тексту потрібно перевірити вручну."
      : "PDF ще не завантажено. Сайт допускає публікацію без PDF, але повний текст рекомендований.",
      filled(article.pdf_path) ? "filled" : "optional"),
    item("issue", "Том і номер випуску", volumePresent === issuePresent
      ? volumePresent
        ? "Обидва реквізити є. Стаття потрапить до архіву відповідного випуску."
        : "Реквізитів випуску немає — стаття залишиться в загальному каталозі."
      : "Заповнено лише том або лише номер. Для архіву випусків потрібні обидва поля.",
      volumePresent === issuePresent ? "optional" : "attention"),
    item("doi", "DOI", !doi
      ? "DOI не зазначено; це допустимо, якщо його не зареєстровано."
      : doiSyntaxOk
        ? "Синтаксис схожий на DOI. Перевірте фактичну реєстрацію та правильність посилання."
        : "Формат DOI некоректний. Не вказуйте незареєстровані ідентифікатори.",
      doiSyntaxOk ? "optional" : "attention"),
  ];

  const declarations: { id: string; label: string; value: string | null | undefined }[] = [
    { id: "ethics", label: "Етичне схвалення / незастосовність", value: article.ethics_statement },
    { id: "consent", label: "Інформована згода", value: article.consent_statement },
    { id: "funding", label: "Фінансування", value: article.funding_statement },
    { id: "competing", label: "Конфлікти інтересів", value: article.competing_interests },
    { id: "data", label: "Доступність даних", value: article.data_availability },
    { id: "contributions", label: "Внесок авторів", value: article.author_contributions },
    { id: "ai", label: "Використання ШІ", value: article.ai_disclosure },
  ];

  return [
    { id: "essentials", title: "Базові метадані", summary: "Технічні поля, необхідні для коректного запису й прозорого опису розгляду.", items: essentials },
    { id: "details", title: "Наукові та бібліографічні відомості", summary: "Додаткові реквізити, перевірка узгодженості та рекомендовані матеріали.", items: additional },
    {
      id: "declarations",
      title: "Декларації авторів",
      summary: "Наявність тексту не доводить його правдивість. Порожнє поле означає «Не зазначено», а не відсутність етичного чи фінансового питання.",
      items: declarations.map(({ id, label, value }) =>
        item(id, label, filled(value)
          ? "Текст внесено. Перевірте джерело, зміст і його відповідність фактичним документам."
          : "Не зазначено. Уточніть фактичні відомості або обґрунтуйте незастосовність.",
          filled(value) ? "filled" : "attention")),
    },
  ];
}
