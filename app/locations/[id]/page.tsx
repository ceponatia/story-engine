import { LocationPage } from "@/components/locations/location-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LocationPage id={id} />;
}