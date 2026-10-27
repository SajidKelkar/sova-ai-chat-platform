import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import { generateAiResponse } from "./openRouterService.js";

const SUMMARY_CHUNK_SIZE = 20;
const SUMMARY_LOCK_SECONDS = 10 * 60;

export const updateSummaryIfNeeded = async (chatId) => {
    const now = new Date();
    const lockId = randomUUID();
    const chat = await Chat.findOneAndUpdate(
        {
            _id: chatId,
            $expr: {
                $gte: [
                    { $subtract: ["$messageCount", "$summarizedTillMessageNumber"] },
                    SUMMARY_CHUNK_SIZE
                ]
            },
            $or: [
                { summaryLockExpiresAt: null },
                { summaryLockExpiresAt: { $lte: now } }
            ]
        },
        {
            $set: {
                summaryLockId: lockId,
                summaryLockExpiresAt: new Date(now.getTime() + SUMMARY_LOCK_SECONDS * 1000)
            }
        },
        { new: true }
    );

    if (!chat) return;

    try {
        const messagesToSummarize = await Message.find({
            chatId: chat._id,
            userId: chat.userId
        })
            .sort({ createdAt: 1, _id: 1 })
            .skip(chat.summarizedTillMessageNumber)
            .limit(SUMMARY_CHUNK_SIZE);

        if (messagesToSummarize.length === 0) return;

        const summaryMessages = [
            {
                role: "system",
                content: "Summarize the conversation. Keep important context, user goals, decisions, and unresolved doubts. Do not add extra information."
            },
            {
                role: "user",
                content: `Previous summary: ${chat.summary || "No previous summary yet."}`
            },
            ...messagesToSummarize.map((message) => ({
                role: message.role,
                content: message.content
            })),
            {
                role: "user",
                content: "Summarize the above conversation."
            }
        ];

        const { aiReply, usage } = await generateAiResponse({
            model: chat.model,
            messages: summaryMessages
        });

        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                const summaryUpdate = await Chat.updateOne(
                    {
                        _id: chat._id,
                        summaryLockId: lockId,
                        summarizedTillMessageNumber: chat.summarizedTillMessageNumber
                    },
                    {
                        $set: {
                            summary: aiReply,
                            summaryUpdatedAt: new Date(),
                            summaryLockId: null,
                            summaryLockExpiresAt: null
                        },
                        $inc: {
                            summarizedTillMessageNumber: messagesToSummarize.length,
                            "usage.promptTokens": usage.promptTokens,
                            "usage.completionTokens": usage.completionTokens,
                            "usage.totalTokens": usage.totalTokens
                        }
                    },
                    { session }
                );

                if (summaryUpdate.matchedCount !== 1) {
                    throw new Error("Chat summary lock was lost");
                }

                const updatedUser = await User.findByIdAndUpdate(
                    chat.userId,
                    {
                        $inc: {
                            "usage.tokenUsed": usage.totalTokens,
                            "usage.totalTokenUsed": usage.totalTokens
                        }
                    },
                    { session }
                );

                if (!updatedUser) {
                    throw new Error("User no longer exists");
                }
            });
        } finally {
            await session.endSession();
        }
    } finally {
        await Chat.updateOne(
            { _id: chat._id, summaryLockId: lockId },
            {
                $set: {
                    summaryLockId: null,
                    summaryLockExpiresAt: null
                }
            }
        );
    }
};
