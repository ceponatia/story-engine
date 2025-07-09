export function useToast() {
    const toast = ({ title, description, variant, }) => {
        console.log(`Toast: ${title}${description ? ` - ${description}` : ""}`);
        if (typeof window !== "undefined") {
            alert(`${title}${description ? `\n${description}` : ""}`);
        }
    };
    return { toast };
}
