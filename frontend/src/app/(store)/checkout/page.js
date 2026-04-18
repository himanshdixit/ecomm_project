import CheckoutClient from "@/components/checkout/CheckoutClient";
import { noIndexRobots } from "@/lib/seo";
import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Checkout",
  robots: noIndexRobots,
};

export default async function CheckoutPage() {
  const user = await requireUser("/login?redirect=/checkout");

  return <CheckoutClient user={user} />;
}
