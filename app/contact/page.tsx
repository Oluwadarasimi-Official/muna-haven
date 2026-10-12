import { getPublicSettings, SETTING_DEFAULTS } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getPublicSettings();
  const email = settings.email || SETTING_DEFAULTS.email;
  const waDisplay = settings.whatsapp_display || SETTING_DEFAULTS.whatsapp_display;
  const waNumber = settings.whatsapp_number || SETTING_DEFAULTS.whatsapp_number;
  const telegram = settings.telegram_url || SETTING_DEFAULTS.telegram_url;

  const cards = [
    {
      title: "Email",
      value: email,
      href: `mailto:${email}`,
      hint: "Send us a message anytime.",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C6A46A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      ),
    },
    {
      title: "WhatsApp",
      value: waDisplay,
      href: `https://wa.me/${waNumber}?text=${encodeURIComponent("Hello Muna's Haven! 👋")}`,
      hint: "Fastest way to enquire & order.",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#128C4B" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      ),
    },
    {
      title: "Telegram",
      value: "TrustOSLLC",
      href: telegram,
      hint: "Reach us on Telegram.",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#C6A46A" aria-hidden="true">
          <path d="M21.9 4.6L2.7 12.1c-.8.3-.8 1.4.1 1.6l4.7 1.5 1.8 5.6c.3.8 1.3.9 1.8.2l2.6-3.1 4.9 3.6c.6.5 1.6.1 1.8-.7l2.4-14.1c.2-1-.9-1.8-1.9-1.1zM8.6 13.2l9.5-6.7c.2-.1.4.1.2.3l-7.9 7.4-.3 3-1.5-4z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10 text-center">
        <p className="text-xs font-medium tracking-[0.35em] text-gold uppercase">Say hello</p>
        <h1 className="mt-3 font-display text-4xl text-espresso sm:text-5xl">Contact us</h1>
        <div className="mx-auto mt-4 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-12 bg-gold/70" />
          <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
          <span className="h-px w-12 bg-gold/70" />
        </div>
        <p className="mx-auto mt-5 max-w-xl text-[16px] text-espresso/70">
          Questions about a piece, an order, or anything else — we&rsquo;d love to hear from you.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {cards.map((c) => (
          <a
            key={c.title}
            href={c.href}
            target={c.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={c.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            className="group flex flex-col items-center rounded-3xl border border-espresso/10 bg-white/70 px-6 py-8 text-center shadow-[0_2px_16px_rgba(56,39,36,0.06)] transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blush/20">
              {c.icon}
            </div>
            <h2 className="mt-4 font-display text-xl text-espresso">{c.title}</h2>
            <p className="mt-1 break-all text-[15px] font-medium text-espresso/85">{c.value}</p>
            <p className="mt-2 text-sm text-espresso/60">{c.hint}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
