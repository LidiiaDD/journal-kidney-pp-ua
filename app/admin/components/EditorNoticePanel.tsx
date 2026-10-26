import { issueEditorialNoticeAction } from "@/app/admin/actions";
import {
  formatNoticeDate, noticeLabels, noticeUrl, strongestNotice,
  type JrsNotice, type NoticeKind,
} from "@/app/lib/jrs-notices";

type Props = {
  articleId: string;
  notices: JrsNotice[];
  error?: string;
  added?: boolean;
};

const options: NoticeKind[] = ["correction", "concern", "retraction"];

export default function EditorNoticePanel({ articleId, notices, error, added = false }: Props) {
  const current = strongestNotice(notices);
  return (
    <section className="jrs-admin-notice-panel" aria-labelledby="jrs-editor-notice-title">
      <div className="jrs-notice-editor-header">
        <span>JRS / PUBLICATION HISTORY</span>
        <h2 id="jrs-editor-notice-title">Історія публікації</h2>
        <p>Оприлюднені наукові дані не змінюються непомітно. Якщо потрібне виправлення, занепокоєння щодо достовірності чи відкликання — створіть окреме офіційне повідомлення.</p>
      </div>

      {added && <p className="jrs-notice-editor-success" role="status">Редакційне повідомлення оприлюднено. Воно доступне читачам і додане до історії статті.</p>}
      {error?.startsWith("notice-") && (
        <p className="jrs-notice-editor-error" role="alert">
          {error === "notice-fields"
            ? "Перевірте тип повідомлення, назву, повний опис і підтвердження публічності."
            : "Не вдалося додати повідомлення. Дані статті не змінено; спробуйте повторно після перевірки доступу."}
        </p>
      )}

      <div className="jrs-editor-notice-counts">
        <div><strong>{notices.length}</strong><span>оприлюднених повідомлень</span></div>
        <div><strong>{current ? noticeLabels[current] : "Без повідомлень"}</strong><span>найсерйозніший статус</span></div>
      </div>

      {notices.length > 0 && (
        <div className="jrs-editor-notice-timeline">
          <h3>Опублікована історія</h3>
          {notices.map(notice => (
            <div className={`jrs-editor-notice-entry is-${notice.kind}`} key={notice.id}>
              <span>{noticeLabels[notice.kind]} · {formatNoticeDate(notice.issued_at)}</span>
              <strong>{notice.title}</strong>
              <a href={noticeUrl(notice.id)} target="_blank" rel="noopener noreferrer">Переглянути повідомлення ↗</a>
            </div>
          ))}
        </div>
      )}

      <form action={issueEditorialNoticeAction} className="jrs-notice-editor-form">
        <input type="hidden" name="article_id" value={articleId} />
        <h3>Нове офіційне повідомлення</h3>
        <p>Перед публікацією перевірте підстави, узгодження з авторами та формулювання. Цей запис не можна буде виправити чи видалити через звичайний редакторський інтерфейс.</p>
        <label>Тип рішення *
          <select name="kind" required defaultValue="">
            <option value="" disabled>Виберіть фактичне рішення редакції</option>
            {options.map(kind => <option key={kind} value={kind}>{noticeLabels[kind]}</option>)}
          </select>
        </label>
        <label>Назва повідомлення *
          <input name="title" required minLength={10} maxLength={220}
            placeholder="Наприклад: Виправлення до статті про ..." />
        </label>
        <label>Детальний опис і підстави *
          <textarea name="explanation" required minLength={40} maxLength={10000} rows={7}
            placeholder="Вкажіть факти, які змінилися або викликають занепокоєння, та які частини висновків це зачіпає. Не публікуйте персональні дані пацієнтів."/>
          <small>Не менше 40 символів. Не розкривайте конфіденційні матеріали, особисті дані чи неперевірені обвинувачення.</small>
        </label>
        <label className="jrs-notice-editor-confirm">
          <input type="checkbox" name="confirm_public" value="yes" required />
          <span>Я підтверджую, що редакційне рішення ухвалене, факти перевірено в межах наявних матеріалів, а повідомлення буде негайно доступне всім читачам.</span>
        </label>
        <button type="submit">Оприлюднити офіційне повідомлення</button>
      </form>
    </section>
  );
}
