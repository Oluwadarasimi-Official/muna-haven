import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10 text-center">
        <p className="text-xs font-medium tracking-[0.35em] text-gold uppercase">Our story</p>
        <h1 className="mt-3 font-display text-4xl text-espresso sm:text-5xl">About Muna&rsquo;s Haven</h1>
        <div className="mx-auto mt-4 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-12 bg-gold/70" />
          <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
          <span className="h-px w-12 bg-gold/70" />
        </div>
      </div>

      <div className="space-y-6 text-[16px] leading-relaxed text-espresso/80">
        <p>
          Muna&rsquo;s Haven is a boutique built around one simple idea: every
          woman deserves pieces that make her feel radiant. We curate quality
          human hair and jewellery — from everyday elegance to statement pieces
          for owambe, weddings, dinners, church, and every rich-aunty moment in
          between.
        </p>
        <p>
          Shopping with us is personal. There are no carts and no checkouts —
          browse the collection, tap any piece you love, and enquire directly on
          WhatsApp. We&rsquo;ll confirm availability, answer your questions, and
          arrange your order with you one-on-one.
        </p>
        <p>
          Whether you&rsquo;re refreshing your look or finding the perfect gift,
          you&rsquo;re welcome here. Take your time, explore the Haven — and
          don&rsquo;t hesitate to say hello.
        </p>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/shop"
          className="inline-block rounded-full bg-espresso px-9 py-3.5 text-base font-medium text-ivory transition-opacity hover:opacity-95"
        >
          Browse the collection
        </Link>
      </div>
    </div>
  );
}
