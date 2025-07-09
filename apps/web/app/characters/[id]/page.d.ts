export default function Page({ params, searchParams, }: {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{
        mode?: string;
    }>;
}): Promise<import("react").JSX.Element>;
//# sourceMappingURL=page.d.ts.map