import OrderDetailClient from "@/components/orders/OrderDetailClient";
import { requireUser } from "@/lib/auth";
import { noIndexRobots } from "@/lib/seo";

export const metadata = {
  title: "Track Order",
  robots: noIndexRobots,
};

export default async function AccountOrderDetailPage({ params }) {
  const { id } = await params;
  const user = await requireUser(`/login?redirect=/account/orders/${id}`);

  return <OrderDetailClient user={user} orderId={id} />;
}
