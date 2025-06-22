import { NewCharacterForm } from "@/components/new-character-form";

export default function Page() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="my-4 text-2xl font-bold">Create New Character</h1>
      <NewCharacterForm />
    </div>
  );
}
