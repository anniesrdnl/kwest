import "server-only";
import { getPlayer } from "@/features/profile/queries";
import { createClient } from "@/lib/supabase/server";
import { lookOf, type AvatarLook } from "./avatar";

export const SHOP_CATEGORIES = ["avatar_icon", "avatar_color", "avatar_frame"] as const;
export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export type ShopItem = {
  key: string;
  name: string;
  category: ShopCategory;
  price: number;
  unlockLevel: number;
  /** Bought, or free and unlocked at the player's level. */
  owned: boolean;
  /** The player's level is too low to buy or use it yet. */
  locked: boolean;
};

export type Shop = {
  name: string;
  level: number;
  coins: number;
  look: AvatarLook;
  items: ShopItem[];
};

export async function getShop(): Promise<Shop> {
  const { id, profile, stats } = await getPlayer();
  const supabase = await createClient();

  const [items, inventory] = await Promise.all([
    supabase.from("items").select("key, name, category, price, unlock_level").in("category", [...SHOP_CATEGORIES]).order("sort"),
    supabase.from("inventory").select("item_key").eq("user_id", id),
  ]);
  if (items.error) throw new Error(`Could not load the shop: ${items.error.message}`);
  if (inventory.error) throw new Error(`Could not load your items: ${inventory.error.message}`);

  const bought = new Set(inventory.data.map((r) => r.item_key));
  return {
    name: profile.display_name,
    level: stats.level,
    coins: stats.coins,
    look: lookOf(profile),
    items: items.data.map((i) => ({
      key: i.key,
      name: i.name,
      category: i.category as ShopCategory,
      price: i.price,
      unlockLevel: i.unlock_level,
      owned: bought.has(i.key) || (i.price === 0 && stats.level >= i.unlock_level),
      locked: stats.level < i.unlock_level,
    })),
  };
}
