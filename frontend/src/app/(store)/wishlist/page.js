import WishlistClient from "@/components/wishlist/WishlistClient";
import { requireUser } from "@/lib/auth";
import { noIndexRobots } from "@/lib/seo";

export const metadata = {
  title: "Wishlist",
  robots: noIndexRobots,
};

export default async function WishlistPage() {
  const user = await requireUser("/login?redirect=/wishlist");

  return <WishlistClient user={user} />;
}
