import type { Metadata } from "next";
import { Playfair_Display, Jost } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { headers } from "next/headers";
import { getPublicSettings, SETTING_DEFAULTS } from "@/lib/settings";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Mun's Haven — Timeless Hair & Jewellery",
  description:
    "Mun's Haven — a premium boutique for quality human hair and timeless jewellery pieces. Enquire on WhatsApp.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSettings();
  const waDisplay = settings.whatsapp_display ?? SETTING_DEFAULTS.whatsapp_display;
  // The owner dashboard (/admin) has its own chrome; don't wrap it in the
  // storefront header/footer.
  const headersList = headers();
  const isAdmin = (headersList.get("x-invoke-path") ?? "").startsWith("/admin");

  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${jost.variable} font-sans bg-ivory text-espresso antialiased min-h-screen flex flex-col`}
      >
        {isAdmin ? (
          <>{children}</>
        ) : (
          <>
            <SiteHeader whatsappDisplay={waDisplay} />
            <main className="flex-1">{children}</main>
            <SiteFooter settings={settings} />
          </>
        )}
      </body>
    </html>
  );
}
