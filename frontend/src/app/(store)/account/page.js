import AccountDashboardClient from "@/components/account/AccountDashboardClient";
import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "My Account",
};

export default async function AccountPage() {
  const user = await requireUser("/login?redirect=/account");

  return <AccountDashboardClient initialUser={user} />;
}
