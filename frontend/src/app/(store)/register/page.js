import AuthForm from "@/components/forms/AuthForm";
import { requireGuest } from "@/lib/auth";
import { noIndexRobots } from "@/lib/seo";

export const metadata = {
  title: "Register",
  robots: noIndexRobots,
};

export default async function RegisterPage() {
  await requireGuest();

  return (
    <main className="page-shell section-gap">
      <AuthForm mode="register" />
    </main>
  );
}
