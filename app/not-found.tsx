import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <Image
        src="/logo.jpg"
        alt="Muna's Haven logo"
        width={72}
        height={72}
        sizes="72px"
        className="h-[72px] w-[72px] rounded-full object-cover ring-1 ring-gold/50"
      />
      <h1 className="mt-8 font-display text-5xl text-espresso">Page not found</h1>
      <div className="mt-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px w-12 bg-gold/70" />
        <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
        <span className="h-px w-12 bg-gold/70" />
      </div>
      <p className="mt-5 text-[16px] leading-relaxed text-espresso/70">
        This piece seems to have wandered off the shelf. Let&rsquo;s get you back to something beautiful.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-espresso px-8 py-3 text-sm font-medium text-ivory transition-opacity hover:opacity-90"
        >
          Home
        </Link>
        <Link
          href="/shop"
          className="rounded-full border border-espresso/30 px-8 py-3 text-sm font-medium text-espresso transition-colors hover:border-gold hover:bg-gold/10"
        >
          Shop
        </Link>
      </div>
    </div>
  );
}
