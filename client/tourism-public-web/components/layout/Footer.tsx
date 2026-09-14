import Link from "next/link";

import { i18n } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";

export async function Footer() {
  const locale = await resolveLocale();
  const t = i18n(locale);
  const year = new Date().getFullYear();

  // The old footer was a photo with a copyright line over it: no links, no way
  // out. A site footer is navigation, so this one carries the same routes the
  // header does plus the contact details.
  const columns = [
    {
      title: t.home.footerExplore,
      links: [
        { label: t.navTours, href: "/tours" },
        { label: t.navHouses, href: "/houses" },
      ],
    },
    {
      title: t.home.footerCompany,
      links: [
        { label: t.nav.about, href: "/#about" },
        { label: t.nav.contact, href: "/#contact" },
      ],
    },
  ];

  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="text-lg font-semibold text-[color:var(--text)]">{t.siteTitle}</div>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-[color:var(--muted)]">
            {t.home.footerTagline}
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <div className="text-sm font-semibold text-[color:var(--text)]">{column.title}</div>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[color:var(--muted)] transition hover:text-[color:var(--primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <div className="text-sm font-semibold text-[color:var(--text)]">
            {t.home.footerContact}
          </div>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
            <li dir="ltr">{t.home.contactPhone}</li>
            <li dir="ltr">{t.home.contactEmail}</li>
            <li>{t.home.contactAddress}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[color:var(--border)] py-5">
        <p className="mx-auto max-w-6xl px-6 text-center text-xs text-[color:var(--muted)]">
          {t.copyright.replace("2024", String(year))}
        </p>
      </div>
    </footer>
  );
}
