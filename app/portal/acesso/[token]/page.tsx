import TemporaryAccess from "./temporary-access";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <TemporaryAccess token={token} />;
}
