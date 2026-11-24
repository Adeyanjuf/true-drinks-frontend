import type { ReactNode } from "react";
import { redirectIfSignedIn } from "@/lib/auth/customer";

// Customer sign in and sign up pages: a signed in customer goes straight home.
export default async function CustomerAuthLayout({ children }: { children: ReactNode }) {
  await redirectIfSignedIn();
  return children;
}
