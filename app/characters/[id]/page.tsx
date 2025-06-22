import { CharacterPage } from "@/components/characters/character-page";

export default function Page({ params }: { params: { id: string } }) {
  return <CharacterPage id={params.id} />;
}
