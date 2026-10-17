"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type ShopResult = { ok: true; message: string } | { ok: false; message: string };

type AvatarColumn = "avatar_icon" | "avatar_color" | "avatar_frame";

/** Buys an item with coins (buy_item RPC checks level, price and coins). */
export async function buyShopItem(itemKey: string): Promise<ShopResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("buy_item", { p_item_key: itemKey });
  if (error) {
    const messages: Record<string, string> = {
      insufficient_coins: "You don't have enough coins yet. Study a little more to earn them.",
      level_locked: "Reach a higher level to unlock this.",
      already_owned: "You already own this.",
    };
    return { ok: false, message: messages[error.message] ?? "Couldn't buy that. Please try again." };
  }
  refresh();
  return { ok: true, message: "Bought! It's yours now." };
}

/** Shows an owned item on your avatar (or null for the default look). The database checks ownership. */
export async function equipShopItem(category: AvatarColumn, itemKey: string | null): Promise<ShopResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(category === "avatar_icon" ? { avatar_icon: itemKey } : category === "avatar_color" ? { avatar_color: itemKey } : { avatar_frame: itemKey })
    .eq("id", user.id);
  if (error) {
    return {
      ok: false,
      message: error.message === "not_owned" ? "Buy this first to use it." : "Couldn't change your avatar. Please try again.",
    };
  }
  refresh();
  return { ok: true, message: "Avatar updated." };
}
