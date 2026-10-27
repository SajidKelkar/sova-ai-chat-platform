import { redisClient } from "../config/redis.js";
import { TOKEN_WINDOW_SECONDS } from "../config/usage.js";

export const resetUsageIfNeeded = async (user) => {
  const now = new Date();

  if (now > user.usage.resetAt) {
    user.usage.tokenUsed = 0;
    user.usage.resetAt = new Date(now.getTime() + TOKEN_WINDOW_SECONDS * 1000);
    await user.save();
    await redisClient.del(`token-usage:${user._id}`);
  }

};

export const hasTokenLimitReached = (user) => {

  return user.usage.tokenUsed >= user.usage.tokenLimit;

};

export const addUserTokenUsage = async (user, totalTokens) => {
    
  user.usage.tokenUsed += totalTokens;
  user.usage.totalTokenUsed += totalTokens;

  await user.save();
};