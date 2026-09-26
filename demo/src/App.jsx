import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import CampaignPage from "./pages/CampaignPage.jsx";
import CustomerPage from "./pages/CustomerPage.jsx";
import { loadMessages } from "./lib/data.js";

// #/            -> kampanya demosu
// #/customer/459?m=12 -> müşteri analizi (m: ana sayfada seçili mesajın id'si)
function parseHash() {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const [path, query = ""] = raw.split("?");
  const params = new URLSearchParams(query);
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "customer") {
    return { page: "customer", accountId: parts[1] ? Number(parts[1]) : null, messageId: params.has("m") ? Number(params.get("m")) : null };
  }
  return { page: "campaign", messageId: params.has("m") ? Number(params.get("m")) : null };
}

export default function App() {
  const [route, setRoute] = useState(parseHash);
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState(null);

  // Ana sayfa durumu App seviyesinde tutulur; analiz sayfasından dönünce seçim kaybolmaz.
  const [campaign, setCampaign] = useState({ trigger: "income_increase", provider: "all", channel: "all", current: null });

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    loadMessages()
      .then(setMessages)
      .catch((e) => setError(e.message));
  }, []);

  const byId = useMemo(() => (messages ? new Map(messages.map((m) => [m.id, m])) : null), [messages]);

  // #/?m=ID ile belirli bir mesajı doğrudan aç (sunumda aynı müşteriyi göstermek için)
  useEffect(() => {
    if (route.page !== "campaign" || route.messageId == null || !byId) return;
    const m = byId.get(route.messageId);
    if (m) setCampaign({ trigger: m.trigger_type, provider: "all", channel: "all", current: m });
    window.history.replaceState(null, "", "#/");
  }, [route, byId]);

  // Analiz sayfasına doğrudan gelindiyse de bir mesaj seçili olsun
  const activeAccountId = route.page === "customer" ? (route.accountId ?? campaign.current?.account_id) : campaign.current?.account_id;

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <Header page={route.page} accountId={activeAccountId} messageId={campaign.current?.id} />
      {error && (
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="font-display text-2xl">Veri yüklenemedi</p>
          <p className="mt-3 text-muted">{error}</p>
        </div>
      )}
      {!error && !messages && <PageSkeleton />}
      {!error && messages && route.page === "campaign" && <CampaignPage messages={messages} state={campaign} setState={setCampaign} />}
      {!error && messages && route.page === "customer" && (
        <CustomerPage messages={messages} accountId={activeAccountId} focusMessage={route.messageId != null ? byId.get(route.messageId) : campaign.current} />
      )}
      <footer className="mt-24 border-t border-line">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-8 text-xs text-muted sm:flex-row sm:justify-between sm:px-8 lg:px-14">
          <span>Innovation Campus · AI in Marketing (Yapay Zekâ ile Pazarlama) · Capstone Demo</span>
          <span>Data (Veri): Berka / PKDD'99 Financial Dataset · Tutarlar Çek korunası (CZK)</span>
        </div>
      </footer>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] animate-pulse px-4 py-16 sm:px-8 lg:px-14">
      <div className="h-4 w-48 rounded-full bg-surface" />
      <div className="mt-6 h-14 w-2/3 rounded-2xl bg-surface" />
      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-36 rounded-3xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
