import type { Metadata } from "next";
import { ShopBoard } from "@/features/shop/components/shop-board";
import { getShop } from "@/features/shop/queries";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const shop = await getShop();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rise space-y-1">
        <h1 className="text-2xl sm:text-[2rem] sm:leading-tight">Shop</h1>
        <p className="text-text-muted">Spend your coins on a new look for your avatar.</p>
      </div>
      <ShopBoard shop={shop} />
    </div>
  );
}
