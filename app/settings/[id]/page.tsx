import { SettingPage } from "@/components/settings/setting-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SettingPage id={id} />;
}