export const defaultPromptHooks = {
    assemble(input) {
        const out = [];
        if (input.system)
            out.push({ role: 'system', content: input.system });
        if (input.character)
            out.push({ role: 'system', content: input.character });
        if (input.memory?.length)
            out.push({ role: 'system', content: input.memory.join('\n') });
        // tools descriptors are not embedded here; callers can provide tool mode via options
        out.push(...input.userMessages);
        return out;
    },
    sanitize(messages, _opts) {
        // Simple sanitize: trim, collapse whitespace
        return messages.map((m) => ({
            ...m,
            content: m.content.replace(/\s+/g, ' ').trim(),
        }));
    },
};
//# sourceMappingURL=assembly.js.map