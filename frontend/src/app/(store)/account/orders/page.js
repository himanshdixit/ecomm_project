import OrdersClient from "@/components/orders/OrdersClient";
import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "My Orders",
};

export default async function OrdersPage() {
  const user = await requireUser("/login?redirect=/account/orders");

  return <OrdersClient user={user} embedded />;
}
