"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * A value that only exists in the browser (URL query, time zone...).
 * Returns `serverValue` during server render/hydration, then the browser value.
 * Use it with a controlled hidden input so React form resets keep the value.
 */
export function useBrowserValue(read: () => string, serverValue = ""): string {
  return useSyncExternalStore(noopSubscribe, read, () => serverValue);
}

export const readSearchParam = (name: string) => () =>
  new URLSearchParams(window.location.search).get(name) ?? "";

export const readTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
