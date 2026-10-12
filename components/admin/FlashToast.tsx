"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * Shows a one-time toast from the ?flash= search param, then clears it.
 */
export default function FlashToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const flash = searchParams.get("flash");
    if (flash) {
      setMessage(flash);
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!message) return;
    // Clear the param so the toast doesn't reappear on refresh.
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("flash");
      router.replace(`?${params.toString()}`, { scroll: false });
      setMessage(null);
    }, 4200);
    return () => clearTimeout(timer);
  }, [message, router, searchParams]);

  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-espresso text-ivory text-sm font-medium px-5 py-2.5 shadow-lg whitespace-nowrap max-w-[92vw] overflow-hidden text-ellipsis"
    >
      {message}
    </div>
  );
}
