export const DEFAULT_AI_MODEL = process.env.DEFAULT_AI_MODEL?.trim() || "openrouter/free";

const allowedModels = new Set(
    (process.env.OPENROUTER_ALLOWED_MODELS || "")
        .split(",")
        .map((model) => model.trim())
        .filter(Boolean)
);

export const isAllowedModel = (model) =>
    typeof model === "string" &&
    (model === DEFAULT_AI_MODEL || model === "openrouter/free" || model.endsWith(":free") || allowedModels.has(model));
