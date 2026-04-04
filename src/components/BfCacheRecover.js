"use client";

import { useEffect } from "react";

/**
 * iOS Safari BFCache restores a frozen JS heap; Next.js App Router soft navigation
 * often breaks after (e.g. /login won’t open again, keypad listeners dead). A full reload
 * on restore matches common production fixes for WebKit + SPA routers.
 */
export default function BfCacheRecover() {
  useEffect(() => {
    const onPageShow = (e) => {
      if (!e.persisted) return;
      if (!/iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
      window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);
  return null;
}
