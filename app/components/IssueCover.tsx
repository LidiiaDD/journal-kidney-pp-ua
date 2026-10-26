type Props = {
  volume?: string;
  number?: string;
  year?: string;
  variant?: number;
  size?: "standard" | "large";
  upcoming?: boolean;
};

export default function IssueCover({ volume, number, year, variant = 0, size = "standard", upcoming = false }: Props) {
  const theme = (Math.abs(variant) % 4) + 1;
  return (
    <div className={`jrs-issue-cover jrs-issue-cover--${theme}${size === "large" ? " jrs-issue-cover--large" : ""}`}
      aria-label={upcoming ? "Оформлення майбутнього випуску" : `Обкладинка тому ${volume}, випуску ${number}`}>
      <div className="jrs-issue-cover-top">
        <span>JOURNAL OF</span>
        <span>{upcoming ? "IN PREPARATION" : year || "JRS"}</span>
      </div>
      <div className="jrs-issue-cover-title"><span>RENAL</span><span>SCIENCE</span></div>
      <div className="jrs-issue-cover-design" aria-hidden="true">
        <span className="jrs-issue-orbit i1"/>
        <span className="jrs-issue-orbit i2"/>
        <span className="jrs-issue-organ o1"/>
        <span className="jrs-issue-organ o2"/>
        <span className="jrs-issue-fine-line"/>
      </div>
      <div className="jrs-issue-cover-bottom">
        <span>{upcoming ? "НЕОГОЛОШЕНИЙ НОМЕР" : `VOL. ${volume} · NO. ${number}`}</span>
        <span>NEPHROLOGY / RESEARCH</span>
      </div>
    </div>
  );
}
