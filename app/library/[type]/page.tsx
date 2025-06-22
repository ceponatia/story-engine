import { LibraryPage } from "@/components/library-page";

export default function Page({ params }: { params: { type: string } }) {
  return <LibraryPage type={params.type} />;
}
