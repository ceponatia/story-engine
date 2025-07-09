import { ObjectId } from "mongodb";
import { Setting, SettingFormData } from "../entities/setting";
export interface SettingDocument {
    _id?: ObjectId;
    name: string;
    description?: string;
    world_type?: string;
    history?: string;
    tags?: string[];
    user_id: string;
    created_at: Date;
    updated_at: Date;
}
export interface IMongoSettingRepository {
    getByUser(userId: string): Promise<Setting[]>;
    getById(id: string, userId: string): Promise<Setting | null>;
    create(data: SettingFormData, userId: string): Promise<Setting>;
    update(id: string, data: SettingFormData, userId: string): Promise<Setting | null>;
    delete(id: string, userId: string): Promise<boolean>;
}
//# sourceMappingURL=setting.d.ts.map