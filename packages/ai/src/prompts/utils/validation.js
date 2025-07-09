export function validateContext(context) {
    var _a;
    if (!((_a = context.character) === null || _a === void 0 ? void 0 : _a.name)) {
        throw new Error("Character name is required");
    }
    if (!context.userName) {
        throw new Error("User name is required");
    }
    if (!context.adventureTitle) {
        throw new Error("Adventure title is required");
    }
    return true;
}
export function validateTemplate(template) {
    var _a, _b;
    if (!template.content) {
        throw new Error("Template content is required");
    }
    if (!((_a = template.metadata) === null || _a === void 0 ? void 0 : _a.type)) {
        throw new Error("Template metadata.type is required");
    }
    if (!((_b = template.metadata) === null || _b === void 0 ? void 0 : _b.label)) {
        throw new Error("Template metadata.label is required");
    }
    return true;
}
export function validateTemplatePlaceholders(content) {
    const requiredPlaceholders = ["{{character.name}}", "{{userName}}", "{{adventureTitle}}"];
    for (const placeholder of requiredPlaceholders) {
        if (!content.includes(placeholder)) {
            throw new Error(`Template missing required placeholder: ${placeholder}`);
        }
    }
    return true;
}
