"use client";

import { Check, Coins, Lock } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { buyShopItem, equipShopItem, type ShopResult } from "../actions";
import { UserAvatar, type AvatarLook } from "../avatar";
import type { Shop, ShopCategory, ShopItem } from "../queries";

const SECTIONS: { category: ShopCategory; title: string; part: keyof AvatarLook; defaultLabel: string | null }[] = [
  { category: "avatar_icon", title: "Icons", part: "icon", defaultLabel: "Your initial" },
  { category: "avatar_color", title: "Colors", part: "color", defaultLabel: null },
  { category: "avatar_frame", title: "Frames", part: "frame", defaultLabel: "No frame" },
];

/** Shop for avatar icons, colors and frames. Click an item to preview it; buy or use it from its card. */
export function ShopBoard({ shop }: { shop: Shop }) {
  const [preview, setPreview] = useState<Partial<AvatarLook>>({});
  const [result, setResult] = useState<ShopResult | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const previewLook: AvatarLook = { ...shop.look, ...preview };

  const run = (key: string, action: () => Promise<ShopResult>) => {
    setPendingKey(key);
    setConfirmKey(null);
    startTransition(async () => {
      const res = await action();
      setResult(res);
      setPendingKey(null);
      if (res.ok) setPreview({});
    });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-hero-border bg-hero p-6 text-hero-fg sm:flex-row sm:p-8">
        <UserAvatar name={shop.name} look={previewLook} size="xl" />
        <div className="space-y-2 text-center sm:text-left">
          <p className="text-sm font-semibold text-hero-muted">{Object.keys(preview).length ? "Preview" : "Your avatar"}</p>
          <p className="text-xl font-bold">{shop.name}</p>
          <p className="inline-flex items-center gap-2">
            <Coins size={18} className="text-gold" aria-hidden />
            <span className="font-semibold tabular-nums">{shop.coins}</span> coins · Level {shop.level}
          </p>
          {Object.keys(preview).length > 0 && (
            <button type="button" onClick={() => setPreview({})} className="block text-sm font-medium underline underline-offset-4">
              Back to my avatar
            </button>
          )}
        </div>
      </div>

      <div aria-live="polite">
        {result && (
          <p
            role={result.ok ? "status" : "alert"}
            className={`rounded-lg border px-3 py-2 text-sm ${
              result.ok ? "border-correct/30 bg-correct/10 text-correct" : "border-wrong/30 bg-wrong/10 text-wrong"
            }`}
          >
            {result.message}
          </p>
        )}
      </div>

      {SECTIONS.map(({ category, title, part, defaultLabel }) => {
        const items = shop.items.filter((i) => i.category === category);
        const current = shop.look[part];
        return (
          <section key={category} aria-labelledby={`${category}-heading`} className="space-y-3">
            <h2 id={`${category}-heading`} className="text-lg font-semibold">
              {title}
            </h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {defaultLabel && (
                <ItemCard
                  name={defaultLabel}
                  avatar={<UserAvatar name={shop.name} look={{ ...shop.look, [part]: null }} />}
                  status={current === null ? "In use" : "Free"}
                  previewing={preview[part] === null}
                  onPreview={() => setPreview((p) => ({ ...p, [part]: null }))}
                  action={
                    current === null ? null : (
                      <Button variant="outline" className="w-full" disabled={pendingKey !== null} onClick={() => run(`${category}-default`, () => equipShopItem(category, null))}>
                        {pendingKey === `${category}-default` ? "Saving…" : "Use"}
                      </Button>
                    )
                  }
                />
              )}
              {items.map((item) => (
                <ShopItemCard
                  key={item.key}
                  item={item}
                  avatar={<UserAvatar name={shop.name} look={{ ...shop.look, [part]: item.key }} />}
                  inUse={current === item.key || (current === null && item.key === "color-butter")}
                  canAfford={shop.coins >= item.price}
                  pending={pendingKey === item.key}
                  busy={pendingKey !== null}
                  confirming={confirmKey === item.key}
                  previewing={preview[part] === item.key}
                  onPreview={() => setPreview((p) => ({ ...p, [part]: item.key }))}
                  onAskBuy={() => setConfirmKey(item.key)}
                  onCancelBuy={() => setConfirmKey(null)}
                  onBuy={() => run(item.key, () => buyShopItem(item.key))}
                  onUse={() => run(item.key, () => equipShopItem(category, item.key))}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function ShopItemCard({
  item,
  avatar,
  inUse,
  canAfford,
  pending,
  busy,
  confirming,
  previewing,
  onPreview,
  onAskBuy,
  onCancelBuy,
  onBuy,
  onUse,
}: {
  item: ShopItem;
  avatar: React.ReactNode;
  inUse: boolean;
  canAfford: boolean;
  pending: boolean;
  busy: boolean;
  confirming: boolean;
  previewing: boolean;
  onPreview: () => void;
  onAskBuy: () => void;
  onCancelBuy: () => void;
  onBuy: () => void;
  onUse: () => void;
}) {
  let status: React.ReactNode;
  let action: React.ReactNode = null;

  if (inUse) {
    status = "In use";
  } else if (item.owned) {
    status = "Owned";
    action = (
      <Button variant="outline" className="w-full" disabled={busy} onClick={onUse}>
        {pending ? "Saving…" : "Use"}
      </Button>
    );
  } else if (item.locked) {
    status = (
      <span className="inline-flex items-center gap-1">
        <Lock size={14} aria-hidden /> Level {item.unlockLevel}
      </span>
    );
  } else if (confirming) {
    status = <Price price={item.price} />;
    action = (
      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" className="px-2" onClick={onCancelBuy}>
          Cancel
        </Button>
        <Button className="px-2" disabled={busy} onClick={onBuy}>
          {pending ? "…" : "Confirm"}
        </Button>
      </div>
    );
  } else {
    status = <Price price={item.price} />;
    action = (
      <Button variant="secondary" className="w-full" disabled={busy || !canAfford} onClick={onAskBuy} aria-label={`Buy ${item.name} for ${item.price} coins`}>
        {canAfford ? "Buy" : "Not enough coins"}
      </Button>
    );
  }

  return <ItemCard name={item.name} avatar={avatar} status={status} previewing={previewing} onPreview={onPreview} action={action} />;
}

function Price({ price }: { price: number }) {
  return (
    <span className="inline-flex items-center gap-1 tabular-nums">
      <Coins size={14} className="text-gold" aria-hidden /> {price}
    </span>
  );
}

function ItemCard({
  name,
  avatar,
  status,
  previewing,
  onPreview,
  action,
}: {
  name: string;
  avatar: React.ReactNode;
  status: React.ReactNode;
  previewing: boolean;
  onPreview: () => void;
  action: React.ReactNode;
}) {
  const inUse = status === "In use";
  return (
    <li className={`flex flex-col gap-3 rounded-xl border bg-surface p-4 ${previewing ? "border-text" : "border-border"}`}>
      <button
        type="button"
        onClick={onPreview}
        aria-pressed={previewing}
        aria-label={`Preview ${name}`}
        className="flex flex-col items-center gap-3 rounded-lg py-2"
      >
        {avatar}
        <span className="text-sm font-medium">{name}</span>
      </button>
      <p className={`flex items-center justify-center gap-1 text-sm ${inUse ? "font-semibold text-text" : "text-text-muted"}`}>
        {inUse && <Check size={14} aria-hidden />}
        {status}
      </p>
      {action}
    </li>
  );
}
