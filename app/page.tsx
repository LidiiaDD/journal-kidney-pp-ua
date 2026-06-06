export default function Home() {
  return (
    <main
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#0f4c81", fontSize: "42px" }}>
        Journal of Renal Science
      </h1>

      <p style={{ fontSize: "20px" }}>
        Український науковий журнал з нефрології, діалізу та трансплантації нирки.
      </p>

      <hr />

      <h2>Про журнал</h2>

      <p>
        Journal of Renal Science — міжнародний рецензований науковий журнал,
        присвячений сучасним дослідженням у галузі нефрології, діалізу,
        трансплантації нирки та суміжних дисциплін.
      </p>

      <h2>Поточний випуск</h2>

      <p>Випуск буде додано найближчим часом.</p>

      <h2>Для авторів</h2>

      <ul>
        <li>Правила оформлення статей</li>
        <li>Етичні вимоги</li>
        <li>Процедура рецензування</li>
      </ul>

      <h2>Редакційна колегія</h2>

      <p>Інформація буде опублікована найближчим часом.</p>

      <h2>Контакти</h2>

      <p>Email: editor@kidney.pp.ua</p>

      <p>
        © {new Date().getFullYear()} Journal of Renal Science
      </p>
    </main>
  );
}