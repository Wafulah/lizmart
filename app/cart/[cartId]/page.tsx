import { currentUser } from "@/lib/auth";
import CartClient from "./CartClient";
import { getCart } from "@/lib/neondb";
import type { Cart } from "@/lib/neondb/types";

export default async function CartPage() {
  const user = await currentUser();
  
  const cart: Cart | undefined = await getCart();

  return (
    <div className="min-h-screen">
      <CartClient cart={cart} userId={user?.id} />
    </div>
  );
}
