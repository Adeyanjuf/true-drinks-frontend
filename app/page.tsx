import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Brand } from "@/components/auth/brand";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCustomer } from "@/lib/auth/customer";

// Placeholder until the storefront is built: shows the sign in state.
export default async function Home() {
  const customer = await getCustomer("/");
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <Brand />
      {customer ? (
        <>
          <h1 className="text-2xl font-semibold text-midnight">
            Welcome{customer.name ? `, ${customer.name}` : ""}
          </h1>
          <p className="text-sm text-warm-grey">
            {customer.email ? `Signed in as ${customer.email}. ` : ""}The shop is coming soon.
          </p>
          <SignOutButton />
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-midnight">The shop is coming soon</h1>
          <div className="flex gap-3">
            <Link href="/login" className={buttonVariants()}>Sign in</Link>
            <Link href="/register" className={buttonVariants({ variant: "outline" })}>
              Create account
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
