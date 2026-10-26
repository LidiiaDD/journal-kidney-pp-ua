import type { Metadata } from "next";
import { signOutAction } from "./actions";

export const metadata: Metadata = {
  title: "Редакційний кабінет | Journal of Renal Science",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="jrs-admin">
      <header className="jrs-admin-header">
        <div className="wrap jrs-admin-nav">
          <a href="/" className="jrs-admin-brand"><span>JRS</span><b>Редакційний кабінет</b></a>
          <nav aria-label="Навігація редактора">
            <a href="/admin">Матеріали</a>
            <a href="/admin/articles/new">Нова стаття</a>
            <a href="/admin/issues">План випусків</a>
            <a href="/publications">Публікації</a>
          </nav>
          <form action={signOutAction}>
            <button type="submit">Вийти</button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
