import { CompleteProfileForm } from "./complete-profile-form";

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const { ticket } = await searchParams;
  return <CompleteProfileForm ticket={ticket ?? ""} />;
}
