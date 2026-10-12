"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/account", label: "Account" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminNav({ onSignOut }: { onSignOut: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="flex flex-col gap-1 p-4" aria-label="Admin">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            isActive(pathname, item.href)
              ? "bg-espresso text-ivory"
              : "text-espresso/70 hover:bg-blush/20 hover:text-espresso"
          }`}
        >
          {item.label}
        </Link>
      ))}
      <div className="my-2 border-t border-espresso/10" />
      <Link
        href="/"
        onClick={() => setOpen(false)}
        className="rounded-xl px-4 py-2.5 text-sm font-medium text-espresso/70 hover:bg-blush/20 hover:text-espresso"
      >
        View site
      </Link>
      <button
        type="button"
        onClick={onSignOut}
        className="rounded-xl px-4 py-2.5 text-sm font-medium text-left text-red-700 hover:bg-red-50"
      >
        Sign out
      </button>
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-espresso text-ivory px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          className="rounded-lg p-2 hover:bg-white/10"
        >
          <span className="block w-5 h-0.5 bg-ivory mb-1" />
          <span className="block w-5 h-0.5 bg-ivory mb-1" />
          <span className="block w-5 h-0.5 bg-ivory" />
        </button>
        <span className="font-display text-lg">Muna&apos;s Haven · Owner</span>
        <Image
          src="/logo.jpg"
          alt="Muna's Haven"
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 pt-14">
          <div
            className="absolute inset-0 bg-espresso/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-ivory w-64 max-h-[calc(100vh-3.5rem)] overflow-y-auto shadow-xl">
            {links}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white border-r border-espresso/10 min-h-screen sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-5 pt-6 pb-4">
          <Image
            src="/logo.jpg"
            alt="Muna's Haven"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <div>
            <p className="font-display text-lg leading-tight text-espresso">
              Muna&apos;s Haven
            </p>
            <p className="text-xs text-espresso/50">Owner dashboard</p>
          </div>
        </div>
        <div className="flex-1">{links}</div>
      </aside>
    </>
  );
}
