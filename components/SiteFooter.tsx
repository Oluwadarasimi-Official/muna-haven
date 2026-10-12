import Link from "next/link";
import Image from "next/image";
import { SETTING_DEFAULTS } from "@/lib/settings";

export default function SiteFooter({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const email = settings.email || SETTING_DEFAULTS.email;
  const waDisplay = settings.whatsapp_display || SETTING_DEFAULTS.whatsapp_display;
  const waNumber = settings.whatsapp_number || SETTING_DEFAULTS.whatsapp_number;
  const telegram = settings.telegram_url || SETTING_DEFAULTS.telegram_url;
  const delivery = settings.delivery_notice || SETTING_DEFAULTS.delivery_notice;
  const referral = settings.referral_notice || SETTING_DEFAULTS.referral_notice;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-espresso/10 bg-espresso text-ivory/90">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            {/* Logo at 40px — well under the 640px native file: always crisp. */}
            <Image
              src="/logo.jpg"
              alt="Muna's Haven logo"
              width={40}
              height={40}
              sizes="40px"
              className="h-10 w-10 rounded-full object-cover ring-1 ring-gold/50"
            />
            <span className="font-display text-xl text-ivory">Muna&rsquo;s Haven</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ivory/70">
            Timeless hair &amp; jewellery pieces, curated for the modern muse.
          </p>
        </div>

        {/* Quick links */}
        <nav aria-label="Footer">
          <h3 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { href: "/", label: "Home" },
              { href: "/shop", label: "Shop" },
              { href: "/updates", label: "Updates" },
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ivory/70 transition-colors hover:text-ivory">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">Contact</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href={`mailto:${email}`} className="text-ivory/70 transition-colors hover:text-ivory">
                {email}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ivory/70 transition-colors hover:text-ivory"
              >
                WhatsApp: {waDisplay}
              </a>
            </li>
            <li>
              <a
                href={telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ivory/70 transition-colors hover:text-ivory"
              >
                Telegram
              </a>
            </li>
          </ul>
        </div>

        {/* Notices */}
        <div>
          <h3 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">Good to know</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/70">
            <li>{delivery}</li>
            <li>{referral}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs tracking-wide text-ivory/50 sm:px-6">
          © {year} Muna&rsquo;s Haven. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
