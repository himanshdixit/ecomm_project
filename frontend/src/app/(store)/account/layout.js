import AccountShell from "@/components/account/AccountShell";
import { requireUser } from "@/lib/auth";
import { noIndexRobots } from "@/lib/seo";

export const metadata = {
  robots: noIndexRobots,
};

export default async function AccountLayout({ children }) {
  const user = await requireUser("/login?redirect=/account");

  return <AccountShell user={user}>{children}</AccountShell>;
}
