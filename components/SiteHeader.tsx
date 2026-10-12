"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/updates", label: "Updates" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * Site header. The logo (public/logo.jpg, native 640x640) is rendered with
 * next/image at a fixed 44px — far below native resolution, so it stays
 * crisp. sizes="44px" keeps the srcset entry correct.
 */
export default function SiteHeader({ whatsappDisplay }: { whatsappDisplay: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-espresso/10 bg-ivory/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Muna's Haven — home">
          <Image
            src="/logo.jpg"
            alt="Muna's Haven logo"
            width={44}
            height={44}
            sizes="44px"
            priority
            className="h-11 w-11 rounded-full object-cover ring-1 ring-gold/50"
          />
          <span className="font-display text-xl tracking-wide text-espresso sm:text-2xl">
            Muna&rsquo;s Haven
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[15px] tracking-wide transition-colors hover:text-gold ${
                pathname === item.href ? "text-espresso font-semibold" : "text-espresso/70"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`https://wa.me/2347018733485?text=${encodeURIComponent("Hello Muna's Haven! 👋")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-espresso px-5 py-2 text-sm font-medium text-ivory transition-opacity hover:opacity-90"
          >
            WhatsApp us
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full text-espresso md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-espresso/10 bg-ivory px-4 pb-5 pt-2 md:hidden" aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block rounded-xl px-3 py-3 font-display text-lg ${
                pathname === item.href ? "bg-blush/20 text-espresso" : "text-espresso/80"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`https://wa.me/2347018733485?text=${encodeURIComponent("Hello Muna's Haven! 👋")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block rounded-full bg-espresso px-5 py-3 text-center text-sm font-medium text-ivory"
          >
            WhatsApp us · {whatsappDisplay}
          </a>
        </nav>
      )}
    </header>
  );
}
