function positiveIntegerEnv(name, fallback) {
    const rawValue = process.env[name];
    const value = rawValue === undefined || rawValue === ""
        ? fallback
        : Number(rawValue);

    if (!Number.isSafeInteger(value) || value <= 0) {
        throw new Error(`${name} must be a positive integer`);
    }

    return value;
}

export const TOKEN_LIMIT = positiveIntegerEnv("TOKEN_LIMIT", 10000);
export const TOKEN_WINDOW_SECONDS = positiveIntegerEnv("TOKEN_WINDOW_SECONDS", 5 * 60 * 60);
