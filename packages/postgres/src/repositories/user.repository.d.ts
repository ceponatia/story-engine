export interface IUserRepository {
    getById(id: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        email_verified: Date | null;
        image: string | null;
    } | null>;
}
export declare class UserRepository implements IUserRepository {
    getById(id: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        email_verified: Date | null;
        image: string | null;
    } | null>;
}
export declare const userRepository: UserRepository;
//# sourceMappingURL=user.repository.d.ts.map