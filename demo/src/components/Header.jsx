export default function Header({ page, accountId, messageId }) {
  const customerHref = accountId ? `#/customer/${accountId}${messageId != null ? `?m=${messageId}` : ""}` : "#/customer";
  const tabs = [
    { key: "campaign", href: "#/", en: "Campaign Demo", short: "Campaign", tr: "Kampanya Demosu" },
    { key: "customer", href: customerHref, en: "Customer Analytics", short: "Analytics", tr: "Müşteri Analizi" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-14">
        <a href="#/" className="flex min-w-0 items-baseline gap-3">
          <span className="font-display text-base tracking-tight whitespace-nowrap sm:text-xl">Innovation Campus</span>
          <span lang="en" className="hidden text-xs font-bold tracking-[0.12em] text-muted uppercase md:inline">
            AI in Marketing
          </span>
        </a>
        <nav className="flex h-full items-stretch gap-1 sm:gap-6" aria-label="Sayfalar">
          {tabs.map((t) => {
            const active = page === t.key;
            return (
              <a
                key={t.key}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center px-2 text-sm font-bold whitespace-nowrap transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span className="sm:hidden">{t.short}</span>
                <span className="hidden sm:inline">{t.en}</span>
                <span className="ml-1 hidden font-normal text-muted lg:inline">({t.tr})</span>
                <span className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-colors ${active ? "bg-ink" : "bg-transparent"}`} />
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
