"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const noSubscribe = () => () => {};

/** A "beat my score" link with Copy and (where the device has it) Share buttons. */
export function ShareLink({ code, text }: { code: string; text: string }) {
  // The full address and the Share button are only known in the browser.
  const origin = useSyncExternalStore(noSubscribe, () => window.location.origin, () => "");
  const canShare = useSyncExternalStore(noSubscribe, () => typeof navigator.share === "function", () => false);
  const [copied, setCopied] = useState(false);
  const url = `${origin}/challenge/${code}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the link is still selectable in the box.
    }
  };

  const share = () => navigator.share({ title: "Kwest challenge", text, url }).catch(() => {});

  return (
    <div className="space-y-2">
      <label htmlFor={`share-${code}`} className="block text-sm font-medium">
        Send this link to a friend
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={`share-${code}`}
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="min-h-11 w-full min-w-0 rounded-lg border border-border-strong bg-surface px-3 text-base text-text"
        />
        <div className="flex gap-2">
          <Button variant="secondary" onClick={copy} className="flex-1 sm:flex-none">
            {copied ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </Button>
          {canShare && (
            <Button variant="outline" onClick={share} className="flex-1 sm:flex-none">
              <Share2 size={18} aria-hidden />
              Share
            </Button>
          )}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {copied ? "Link copied" : ""}
      </p>
    </div>
  );
}
