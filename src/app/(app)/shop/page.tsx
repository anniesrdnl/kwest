import type { Metadata } from "next";
import { ShopBoard } from "@/features/shop/components/shop-board";
import { getShop } from "@/features/shop/queries";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const shop = await getShop();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold md:text-3xl">Shop</h1>
        <p className="text-text-muted">Spend the coins you earn from studying on a new look for your avatar.</p>
      </div>
      <ShopBoard shop={shop} />
    </div>
  );
}
