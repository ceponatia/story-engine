import { LibraryPage } from "@/components/library/library-page";
export default async function Page({ params }) {
    const { type } = await params;
    return <LibraryPage type={type}/>;
}
