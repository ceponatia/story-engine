interface Message {
    id: string;
    adventure_id: string;
    role: "user" | "assistant" | "system";
    content: string;
    metadata?: Record<string, unknown>;
    created_at: string;
    user_id?: string;
    isPending?: boolean;
    isFailed?: boolean;
    tempId?: string;
}
interface Adventure {
    id: string;
    name: string;
    adventure_characters: Array<{
        name: string;
    }>;
}
interface AdventureChatProps {
    adventure: Adventure;
    initialMessages: Message[];
    userId: string;
}
export declare function AdventureChat({ adventure, initialMessages }: AdventureChatProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=adventure.chat.d.ts.map