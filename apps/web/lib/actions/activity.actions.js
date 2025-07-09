"use server";
import { adventureRepository } from "@/lib/postgres/repositories";
import { MongoCharacterRepository } from "@/lib/mongodb/character.repository";
import { MongoSettingRepository } from "@/lib/mongodb/setting.repository";
import { MongoLocationRepository } from "@/lib/mongodb/location.repository";
const characterRepository = new MongoCharacterRepository();
const settingRepository = new MongoSettingRepository();
const locationRepository = new MongoLocationRepository();
export async function getRecentActivity(userId) {
    try {
        const [adventures, characters, settings, locations] = await Promise.all([
            adventureRepository.getByUser(userId),
            characterRepository.getByUser(userId),
            settingRepository.getByUser(userId),
            locationRepository.getByUser(userId),
        ]);
        const activities = [];
        adventures.forEach((adventure) => {
            activities.push({
                id: `adventure-${adventure.id}`,
                type: "adventure",
                title: adventure.title || adventure.name || "Untitled Adventure",
                description: adventure.character_id ? "Adventure in progress" : "Adventure setup",
                timestamp: adventure.updated_at || adventure.created_at,
                href: `/adventures/${adventure.id}/chat`,
                badge: adventure.status === "active" ? "Active" : "Recent",
                entity_id: adventure.id,
                updated_at: adventure.updated_at || adventure.created_at,
            });
        });
        characters.forEach((character) => {
            activities.push({
                id: `character-${character.id}`,
                type: "character",
                title: character.name,
                description: character.age && character.gender
                    ? `${character.age} year old ${character.gender}`
                    : "Character profile",
                timestamp: character.updated_at || character.created_at,
                href: `/characters/${character.id}`,
                badge: "Updated",
                entity_id: character.id,
                updated_at: character.updated_at || character.created_at,
            });
        });
        settings.forEach((setting) => {
            activities.push({
                id: `setting-${setting.id}`,
                type: "setting",
                title: setting.name,
                description: setting.world_type ? `${setting.world_type} world setting` : "World setting",
                timestamp: setting.updated_at || setting.created_at,
                href: `/settings/${setting.id}`,
                badge: "Updated",
                entity_id: setting.id,
                updated_at: setting.updated_at || setting.created_at,
            });
        });
        locations.forEach((location) => {
            activities.push({
                id: `location-${location.id}`,
                type: "location",
                title: location.name,
                description: location.description
                    ? location.description.substring(0, 60) + "..."
                    : "Location details",
                timestamp: location.updated_at || location.created_at,
                href: `/locations/${location.id}`,
                badge: "Updated",
                entity_id: location.id,
                updated_at: location.updated_at || location.created_at,
            });
        });
        const sortedActivities = activities
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 8);
        return sortedActivities.map((activity) => (Object.assign(Object.assign({}, activity), { timestamp: formatRelativeTime(activity.updated_at) })));
    }
    catch (error) {
        console.error("Error fetching recent activity:", error);
        return [];
    }
}
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInMinutes < 1)
        return "Just now";
    if (diffInMinutes < 60)
        return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    if (diffInHours < 24)
        return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    if (diffInDays < 7)
        return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
    if (diffInDays < 30)
        return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) === 1 ? "" : "s"} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) === 1 ? "" : "s"} ago`;
}
