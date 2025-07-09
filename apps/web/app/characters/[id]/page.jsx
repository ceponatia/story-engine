import { UnifiedCharacterPage } from "@/components/characters/unified-character-page";
export default async function Page({ params, searchParams, }) {
    const { id } = await params;
    const { mode } = await searchParams;
    const validMode = mode === "edit" ? "edit" : "view";
    return <UnifiedCharacterPage id={id} initialMode={validMode}/>;
}
