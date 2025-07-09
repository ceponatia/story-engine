export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce camelCase or dot.case filenames",
    },
    schema: [],
    messages: {
      invalidFilename: "Filename '{{ name }}' must be in camelCase or dot.case. Avoid kebab-case and snake_case.",
    },
  },
  create(context) {
    const filenameWithPath = context.getFilename();
    const filename = filenameWithPath.split("/").pop() ?? "";

    // Remove extension
    const name = filename.replace(/\.[^.]+$/, "");

    const isValid =
      /^[a-z][a-zA-Z0-9]*$/.test(name) || // camelCase
      /^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)+$/.test(name); // dot.case

    if (!isValid) {
      context.report({
        messageId: "invalidFilename",
        data: { name },
        loc: { line: 1, column: 0 },
      });
    }

    return {};
  },
};