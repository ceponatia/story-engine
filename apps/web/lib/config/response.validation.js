export const RESPONSE_VALIDATION_CONFIGS = {
    romance: {
        maxParagraphs: 2,
        enforceAsteriskFormatting: true,
        preventUserSpeaking: true,
        addEndingMarker: false,
        maxTokens: 200,
        stopSequences: [
            "[USER:",
            "User:",
            "\nUser",
            "\n\n\n",
        ],
        actionPatterns: [
            "walked",
            "ran",
            "looked",
            "felt",
            "thought",
            "moved",
            "stepped",
            "turned",
            "smiled",
            "laughed",
            "sighed",
            "breathed",
            "grabbed",
            "scanned",
            "raced",
            "paused",
            "hesitated",
            "nodded",
            "shook",
            "whispered",
            "blushed",
            "gasped",
            "trembled",
            "shivered",
            "melted",
            "leaned",
            "caressed",
            "touched",
        ],
        userPatterns: [
            /(\n|^)(You|User|The user)[\s\w]*?[.!?](\n|$)/gi,
            /(\n|^)["\'].*?(you|user).*?["\'](\n|$)/gi,
            /(\n|^)\*?You\s+(say|said|ask|asked|respond|responded|reply|replied|did|do|will|would|can|could|might|should)/gi,
            /(\n|^)\*?Your\s+(eyes|face|hands|voice|heart|mind|lips|skin|touch)/gi,
        ],
        contextWindow: {
            default: 18,
            min: 15,
            max: 20,
        },
    },
    action: {
        maxParagraphs: 2,
        enforceAsteriskFormatting: true,
        preventUserSpeaking: true,
        addEndingMarker: false,
        maxTokens: 200,
        stopSequences: ["[USER:", "User:", "\nUser", "\n\n\n"],
        actionPatterns: [
            "walked",
            "ran",
            "looked",
            "felt",
            "thought",
            "moved",
            "stepped",
            "turned",
            "smiled",
            "laughed",
            "sighed",
            "breathed",
            "grabbed",
            "scanned",
            "raced",
            "paused",
            "hesitated",
            "nodded",
            "shook",
            "whispered",
            "shouted",
            "jumped",
            "ducked",
            "aimed",
            "fired",
            "blocked",
            "dodged",
            "struck",
            "hit",
            "rolled",
            "sprinted",
            "charged",
            "slashed",
            "parried",
            "crouched",
            "leaped",
        ],
        userPatterns: [
            /(\n|^)(You|User|The user)[\s\w]*?[.!?](\n|$)/gi,
            /(\n|^)["\'].*?(you|user).*?["\'](\n|$)/gi,
            /(\n|^)\*?You\s+(say|said|ask|asked|respond|responded|reply|replied|did|do|will|would|can|could|might|should)/gi,
            /(\n|^)\*?Your\s+(eyes|face|hands|voice|heart|mind|weapon|gear|equipment)/gi,
        ],
        contextWindow: {
            default: 10,
            min: 8,
            max: 12,
        },
    },
    general: {
        maxParagraphs: 3,
        enforceAsteriskFormatting: false,
        preventUserSpeaking: true,
        addEndingMarker: false,
        maxTokens: 300,
        stopSequences: ["[USER:", "User:", "\nUser"],
        actionPatterns: [],
        userPatterns: [
            /(\n|^)(You|User|The user)[\s\w]*?[.!?](\n|$)/gi,
            /(\n|^)\*?You\s+(say|said|ask|asked|respond|responded|reply|replied)/gi,
        ],
        contextWindow: {
            default: 10,
            min: 8,
            max: 15,
        },
    },
};
export function getValidationConfig(adventureType) {
    return RESPONSE_VALIDATION_CONFIGS[adventureType] || RESPONSE_VALIDATION_CONFIGS.general;
}
export async function getValidationConfigWithUser(adventureType, userId) {
    if (userId) {
        const userConfig = await getUserValidationConfig(adventureType, userId);
        if (userConfig)
            return userConfig;
    }
    const publicConfig = await getPublicValidationConfig(adventureType);
    if (publicConfig)
        return publicConfig;
    return RESPONSE_VALIDATION_CONFIGS[adventureType] || RESPONSE_VALIDATION_CONFIGS.general;
}
async function getUserValidationConfig(adventureType, userId) {
    try {
        const { userAdventureTypeRepository } = await import("@/lib/postgres/repositories");
        const userTemplate = await userAdventureTypeRepository.getByName(adventureType, userId);
        return (userTemplate === null || userTemplate === void 0 ? void 0 : userTemplate.validation_config) || null;
    }
    catch (error) {
        console.warn(`Failed to get user validation config for ${adventureType}:`, error);
        return null;
    }
}
async function getPublicValidationConfig(adventureType) {
    try {
        const { userAdventureTypeRepository } = await import("@/lib/postgres/repositories");
        const publicTemplate = await userAdventureTypeRepository.getPublicByName(adventureType);
        return (publicTemplate === null || publicTemplate === void 0 ? void 0 : publicTemplate.validation_config) || null;
    }
    catch (error) {
        console.warn(`Failed to get public validation config for ${adventureType}:`, error);
        return null;
    }
}
export function getStopSequences(adventureType, characterName) {
    const config = getValidationConfig(adventureType);
    const stopSequences = [...config.stopSequences];
    if (characterName) {
        stopSequences.push(`${characterName}:`);
    }
    return stopSequences;
}
export function getContextWindowSize(adventureType, customSize) {
    const config = getValidationConfig(adventureType);
    if (customSize !== undefined) {
        return Math.max(config.contextWindow.min, Math.min(config.contextWindow.max, customSize));
    }
    return config.contextWindow.default;
}
