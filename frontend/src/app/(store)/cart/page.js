import CartClient from "@/components/cart/CartClient";
import { noIndexRobots } from "@/lib/seo";

export const metadata = {
  title: "Cart",
  robots: noIndexRobots,
};

export default function CartPage() {
  return <CartClient />;
}
