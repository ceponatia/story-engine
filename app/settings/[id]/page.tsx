import { UnifiedSettingPage } from "@/components/settings/unified-setting-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UnifiedSettingPage id={id} />;
}