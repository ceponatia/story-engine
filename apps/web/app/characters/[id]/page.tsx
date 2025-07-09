import { UnifiedCharacterPage } from "@/components/characters/unified-character-page";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = await params;
  const { mode } = await searchParams;

  // Validate mode parameter
  const validMode = mode === "edit" ? "edit" : "view";

  return <UnifiedCharacterPage id={id} initialMode={validMode} />;
}
