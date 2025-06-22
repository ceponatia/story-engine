import { LibraryPage } from "@/components/library/library-page";

export default async function Page({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  return <LibraryPage type={type} />;
}
