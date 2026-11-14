"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: (error?: unknown) => void;
          [key: string]: unknown;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (err?: unknown) => void;
  siteKey?: string;
  theme?: "dark" | "light" | "auto";
  size?: "normal" | "compact" | "flexible";
  className?: string;
}

export function Turnstile({
  onVerify,
  onExpire,
  onError,
  siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
  theme = "dark",
  size = "normal",
  className = "",
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  const handleVerify = useCallback(
    (token: string) => {
      onVerify(token);
    },
    [onVerify]
  );

  const handleExpire = useCallback(() => {
    onExpire?.();
  }, [onExpire]);

  const handleError = useCallback(
    (err: unknown) => {
      onError?.(err);
    },
    [onError]
  );

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;

      try {
        containerRef.current.innerHTML = "";
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size,
          callback: (token: string) => {
            if (isMounted) {
              handleVerify(token);
            }
          },
          "expired-callback": () => {
            if (isMounted) {
              handleExpire();
            }
          },
          "error-callback": (err: unknown) => {
            if (isMounted) {
              handleError(err);
            }
          },
        });
        widgetIdRef.current = id;
        setIsRendered(true);
      } catch (err) {
        console.warn("[Turnstile] Render error:", err);
      }
    };

    if (typeof window !== "undefined") {
      if (window.turnstile) {
        renderWidget();
      } else {
        // Dynamically inject script if not present
        const scriptId = "cloudflare-turnstile-script";
        if (!document.getElementById(scriptId)) {
          const script = document.createElement("script");
          script.id = scriptId;
          script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
          script.async = true;
          script.defer = true;
          script.onload = () => {
            if (isMounted) renderWidget();
          };
          document.head.appendChild(script);
        }

        pollInterval = setInterval(() => {
          if (window.turnstile && !widgetIdRef.current) {
            if (pollInterval) clearInterval(pollInterval);
            renderWidget();
          }
        }, 150);
      }
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (widgetIdRef.current && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme, size, handleVerify, handleExpire, handleError]);

  return (
    <div className={`flex flex-col items-center justify-center my-3 min-h-[65px] ${className}`}>
      {!isRendered && (
        <div className="flex items-center gap-2 text-xs text-white/50 py-2 font-mono">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          <span>Initializing Cloudflare Turnstile...</span>
        </div>
      )}
      <div ref={containerRef} className="flex justify-center" />
      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-white/40 font-mono">
        <ShieldCheck className="w-3 h-3 text-amber-400/80" />
        <span>Bot protection active (1 verified vote per voter)</span>
      </div>
    </div>
  );
}
