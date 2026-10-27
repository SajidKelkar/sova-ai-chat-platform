import express from "express";
import { getMessage, sendMessage } from "../controllers/message.controllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";
import authenticatedRateLimiter from "../middlewares/authenticatedRateLimiter.js";
import tokenUsageMiddleware from "../middlewares/tokenUsageMiddleware.js";
import loadUserMiddleware from "../middlewares/loadUserMiddleware.js";

const messageRouter = express.Router();

messageRouter.use(userAuthMiddleware);
messageRouter.use(authenticatedRateLimiter);



messageRouter.get("/:chatId", loadUserMiddleware, getMessage);
messageRouter.post("/", loadUserMiddleware, tokenUsageMiddleware, sendMessage);
messageRouter.post("/:chatId", loadUserMiddleware, tokenUsageMiddleware, sendMessage);

export default messageRouter;
