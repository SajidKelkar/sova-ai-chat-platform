import { redisClient } from "../config/redis.js";

const authenticatedRateLimiter = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                message: "User is not authenticated"
            });
        }

        const key = `rate-limit:user:${userId}`;

        const requestCount = await redisClient.incr(key);

        if (requestCount === 1) {
            await redisClient.expire(key, 60);
        }

        if (requestCount > 20) {
            const remainingTime = await redisClient.ttl(key);

            return res.status(429).json({
                message: `Too many requests. Try again after ${remainingTime} seconds.`
            });
        }

        next();
    } catch (error) {
        console.log("Authenticated rate limiter error:", error);
        return res.status(503).json({
            message: "Rate limiting is temporarily unavailable. Please try again."
        });
    }
};

export default authenticatedRateLimiter;