"use client";

import { useSyncExternalStore } from "react";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/ui/settings-list";
import { useBrowserValue } from "@/lib/hooks/use-browser-value";

/** Chrome and Edge fire this when the app can be installed. Safari (iPhone) never does. */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

let saved: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    saved = e as InstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    saved = null;
    emit();
  });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};

const readStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as { standalone?: boolean }).standalone === true
    ? "yes"
    : "no";

/** Settings box: install Kwest on the home screen. Hidden when Kwest is already running as an installed app. */
export function InstallApp() {
  const prompt = useSyncExternalStore(
    subscribe,
    () => saved,
    () => null,
  );
  const installed = useBrowserValue(readStandalone, "yes") === "yes";
  if (installed) return null;

  return (
    <SettingsSection title="Install on your phone">
      <div className="space-y-3">
        <p className="flex items-start gap-3">
          <Smartphone size={20} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            Add Kwest to your home screen to open it like an app. It still needs
            the internet to work.
          </span>
        </p>
        {prompt ? (
          <Button
            onClick={async () => {
              await prompt.prompt();
              await prompt.userChoice;
              saved = null;
              emit();
            }}
          >
            Install Kwest
          </Button>
        ) : (
          <ul className="space-y-1 text-sm text-text-muted">
            <li>
              <strong className="font-semibold text-text">
                iPhone (Safari):
              </strong>{" "}
              tap the Share button, then &ldquo;Add to Home Screen&rdquo;.
            </li>
            <li>
              <strong className="font-semibold text-text">
                Android (Chrome):
              </strong>{" "}
              open the &#8942; menu, then &ldquo;Install app&rdquo; or
              &ldquo;Add to Home screen&rdquo;.
            </li>
          </ul>
        )}
      </div>
    </SettingsSection>
  );
}
