import { ObjectId } from "mongodb";
import { Location, LocationFormData } from "../entities/location";
export interface LocationDocument {
    _id?: ObjectId;
    name: string;
    description?: string;
    notable_features?: string[];
    connected_locations?: string[];
    tags?: string[];
    user_id: string;
    created_at: Date;
    updated_at: Date;
}
export interface IMongoLocationRepository {
    getByUser(userId: string): Promise<Location[]>;
    getById(id: string, userId: string): Promise<Location | null>;
    create(data: LocationFormData, userId: string): Promise<Location>;
    update(id: string, data: LocationFormData, userId: string): Promise<Location | null>;
    delete(id: string, userId: string): Promise<boolean>;
}
//# sourceMappingURL=location.d.ts.map