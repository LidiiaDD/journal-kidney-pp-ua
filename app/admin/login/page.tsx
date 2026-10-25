import { signInAction } from "../actions";
import { isJrsConfigured } from "@/app/lib/jrs-supabase";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const enabled = isJrsConfigured();
  return (
    <main className="jrs-admin-main">
      <div className="wrap">
        <div className="jrs-login">
          <p className="jrs-admin-kicker">Journal of Renal Science</p>
          <h1>Вхід для редактора</h1>
          <p>Ця частина сайту призначена лише для затверджених редакторів журналу.</p>
          {!enabled ? (
            <div className="jrs-admin-notice error" role="status">
              Кабінет підготовлено, але він ще не підключений до окремої бази даних JRS.
              До налаштування приватного проєкту Supabase вхід вимкнений.
            </div>
          ) : (
            <>
              {error && (
                <div className="jrs-admin-notice error" role="alert">
                  {error === "auth" ? "Сеанс завершився або немає редакційного доступу."
                    : "Вхід не виконано. Перевірте адресу, пароль і дозвіл редактора."}
                </div>
              )}
              <form action={signInAction} className="jrs-admin-form">
                <label>
                  Електронна адреса
                  <input name="email" type="email" autoComplete="username" maxLength={250} required />
                </label>
                <label>
                  Пароль
                  <input name="password" type="password" autoComplete="current-password" required />
                </label>
                <button type="submit" className="jrs-admin-primary">Увійти</button>
              </form>
            </>
          )}
          <p className="jrs-login-help">Доступ не надається через публічну реєстрацію. Для допомоги — <a href="mailto:editor@kidney.pp.ua">editor@kidney.pp.ua</a>.</p>
        </div>
      </div>
    </main>
  );
}
