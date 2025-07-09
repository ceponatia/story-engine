export interface User {
    id: string;
    email: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}
export declare function getUserById(userId: string): Promise<User | null>;
export declare function updateUser(userId: string, data: Partial<User>): Promise<User | null>;
export declare function getCurrentUserAction(): Promise<User | null>;
//# sourceMappingURL=user.actions.d.ts.map