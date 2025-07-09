export function LibraryContainer({ children }) {
    return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mx-auto overflow-y-auto p-4">
      {children}
    </div>);
}
