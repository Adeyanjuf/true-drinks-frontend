import { GoogleCallback } from "./google-callback";

export default async function GoogleCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return <GoogleCallback code={code ?? ""} />;
}
