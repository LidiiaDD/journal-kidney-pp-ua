import {
  formatNoticeDate, noticeLabels, noticeUrl, strongestNotice,
  type JrsNotice,
} from "@/app/lib/jrs-notices";

export default function PublicationNoticeTimeline({ notices }: { notices: JrsNotice[] }) {
  if (!notices.length) return null;
  const status = strongestNotice(notices);
  const concern = status === "retraction" || status === "concern";

  return (
    <section id="publication-history"
      className={`jrs-notice-timeline${concern ? " jrs-notice-timeline--urgent" : ""}`}
      aria-labelledby="jrs-notice-history-title">
      <div className="jrs-notice-timeline-header">
        <span className="jrs-notice-emblem" aria-hidden="true">!</span>
        <div>
          <span className="jrs-notice-kicker">JRS / EDITORIAL RECORD</span>
          <h2 id="jrs-notice-history-title">
            {status === "retraction" ? "Увага: статтю відкликано."
              : status === "concern" ? "Увага: достовірність статті під питанням."
              : "До статті опубліковано виправлення."}
          </h2>
          <p>{status === "retraction"
            ? "Редакція оприлюднила повідомлення про відкликання. Не покладайтеся на висновки статті без прочитання офіційного пояснення."
            : status === "concern"
              ? "Редакція опублікувала занепокоєння щодо матеріалу. Ознайомтеся з підставами перед цитуванням або використанням результатів."
              : "Редакція внесла до публічного наукового запису окреме повідомлення про виправлення. Прочитайте його перед використанням даних."}</p>
        </div>
      </div>
      <ol className="jrs-notice-timeline-list">
        {notices.map(notice => (
          <li key={notice.id} className={`jrs-notice-timeline-entry is-${notice.kind}`}>
            <div>
              <span className="jrs-notice-kind">{noticeLabels[notice.kind]}</span>
              <time dateTime={notice.issued_at}>{formatNoticeDate(notice.issued_at)}</time>
            </div>
            <h3><a href={noticeUrl(notice.id)}>{notice.title} ↗</a></h3>
            <p>{notice.explanation.length > 320
              ? notice.explanation.slice(0, 320).trimEnd() + "…"
              : notice.explanation}</p>
          </li>
        ))}
      </ol>
      <a className="jrs-notice-register-link" href="/notices">Усі офіційні повідомлення JRS ↗</a>
    </section>
  );
}
