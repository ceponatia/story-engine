import { NewSettingForm } from "@/components/settings/new-setting-form";
import { LibraryBreadcrumbs } from "@/components/navigation/library-breadcrumbs";

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-6">
      <LibraryBreadcrumbs type="settings" />
      <div className="max-w-2xl mx-auto">
        <h1 className="my-4 text-2xl font-bold">Create New Setting</h1>
        <NewSettingForm />
      </div>
    </div>
  );
}