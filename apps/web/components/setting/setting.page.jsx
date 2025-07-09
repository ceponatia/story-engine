import { LibraryBreadcrumbs } from "@/components/navigation/library-breadcrumbs";
import { getSettingAction } from "@/lib/actions/setting-actions";
import { getCurrentUserAction } from "@/lib/actions/user-actions";
import { UnifiedSettingManager } from "./unified-setting-manager";
export async function UnifiedSettingPage({ id }) {
    let data = null;
    let user = null;
    try {
        [data, user] = await Promise.all([getSettingAction(id), getCurrentUserAction()]);
    }
    catch (error) {
        console.error("Error fetching data:", error);
    }
    if (!data) {
        return (<div className="container mx-auto px-4 py-6">
        <LibraryBreadcrumbs type="settings"/>
        <p className="p-4 text-center">
          Setting not found or you don&apos;t have permission to view it.
        </p>
      </div>);
    }
    return (<div className="container mx-auto px-4 py-6">
      <LibraryBreadcrumbs type="settings" itemName={data.name} itemId={id}/>
      <UnifiedSettingManager mode="view" setting={data} currentUser={user}/>
    </div>);
}
