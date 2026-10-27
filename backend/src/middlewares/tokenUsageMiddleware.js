import { redisClient } from "../config/redis.js";

const tokenUsageMiddleware = async (req, res, next) => {
    try {
        const user = req.user;
        const tokenLimit = user?.usage?.tokenLimit;
        const resetAt = user?.usage?.resetAt;

        if (!Number.isSafeInteger(tokenLimit) || tokenLimit <= 0 || !(resetAt instanceof Date)) {
            return res.status(503).json({
                message: "Token usage limits are not configured correctly."
            });
        }

        const key = `token-usage:${req.userId}`;
        const remainingTime = Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000));
        const cachedUsage = await redisClient.get(key);
        const parsedCachedUsage = cachedUsage === null ? null : Number(cachedUsage);
        const hasValidCachedUsage =
            Number.isSafeInteger(parsedCachedUsage) && parsedCachedUsage >= 0;
        let tokenUsed = hasValidCachedUsage
            ? Math.max(parsedCachedUsage, user.usage.tokenUsed)
            : user.usage.tokenUsed;

        if (!hasValidCachedUsage || parsedCachedUsage < user.usage.tokenUsed) {
            await redisClient.set(key, String(user.usage.tokenUsed), {
                EX: remainingTime
            });
            tokenUsed = user.usage.tokenUsed;
        } else if (await redisClient.ttl(key) < 0) {
            await redisClient.expire(key, remainingTime);
        }

        if (tokenUsed >= tokenLimit) {
            const retryAfter = await redisClient.ttl(key);

            return res.status(429).json({
                message: "Token limit reached. Please try after some time.",
                tokenUsed,
                tokenLimit,
                retryAfter: retryAfter > 0 ? retryAfter : remainingTime
            });
        }

        req.tokenUsageKey = key;

        next();
        
    } catch (error) {
        console.error("Token usage middleware error:", error);
        return res.status(503).json({
            message: "Token usage limits are temporarily unavailable. Please try again."
        });
    }
};

export default tokenUsageMiddleware;