"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

interface LibraryBreadcrumbsProps {
  type?: string;
  itemName?: string;
  itemId?: string;
}

const typeDisplayNames: Record<string, string> = {
  characters: "Characters",
  settings: "Settings",
  locations: "Locations",
};

export function LibraryBreadcrumbs({ type, itemName, itemId }: LibraryBreadcrumbsProps) {
  const pathname = usePathname();

  const isNewPage = pathname.includes("/new");
  const isEditPage = pathname.includes("/edit") || (itemId && !pathname.includes("/new"));

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {type && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {isNewPage || isEditPage ? (
                <BreadcrumbLink asChild>
                  <Link href={`/library/${type}`}>{typeDisplayNames[type] || type}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{typeDisplayNames[type] || type}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {isNewPage && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {isEditPage && itemName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] truncate">{itemName}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
