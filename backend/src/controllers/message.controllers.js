import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { generateAiResponse } from "../service/openRouterService.js";
import { updateSummaryIfNeeded } from "../service/summaryService.js";
import { buildMessagesForAI } from "../utils/chatContext.js";
import { redisClient } from "../config/redis.js";
import { isAllowedModel } from "../config/models.js";

export const getMessage = async (req,res) =>{
    try{

        const{chatId} = req.params;

        if(!chatId){
            return res.status(409).json({
                message: "chatId not provided"
            })
        }

        if(!mongoose.Types.ObjectId.isValid(chatId)){
                return res.status(400).json({
                    message: "chat id not valid"
                })
            }

        const chat = await Chat.findOne({
            _id: chatId,
            userId: req.user._id
        })
        if(!chat){
            return res.status(404).json({
                message: "chat not found"
            })
        }
        if (!isAllowedModel(chat.model)) {
            return res.status(400).json({
                message: "This conversation uses a model that is not enabled for this application."
            });
        }

        const message = await Message.find({
            chatId: chatId,
            userId: req.user._id
        }).sort({ createdAt: 1, _id: 1 });

        res.status(200).json({
            message: "Messages fetched seccessfull",
            msg: message
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const sendMessage = async (req,res) =>{
    let chat;
    let isNewChat = false;
    try{

        const {chatId} = req.params;
        const {content, model} = req.body || {};
        const normalizedContent = typeof content === "string" ? content.trim() : "";

        if(!normalizedContent){
            return res.status(400).json({
                message: "content required"
            })
        }

        if (normalizedContent.length > 20000) {
            return res.status(413).json({
                message: "content must be 20000 characters or fewer"
            });
        }

        if(chatId){ 
            // chatId exists, chatId is provided in req.params

            if(!mongoose.Types.ObjectId.isValid(chatId)){
                return res.status(400).json({
                    message: "chat id not valid"
                })
            }
            chat = await Chat.findOne({
                _id: chatId,
                userId: req.user._id
            })
            if(!chat){
                return res.status(404).json({
                    message: "chat not found"
                })
            }

        }else{
            // new chat, no chatId is provided in req.params

            if(typeof model !== "string" || !isAllowedModel(model.trim())){
                return res.status(400).json({
                    message: "model is missing or not enabled for this application"
                })
            }
            chat = new Chat({
                userId: req.user._id,
                model: model.trim(),
                topic: normalizedContent.slice(0,30)
            })
            isNewChat = true;
        }

        const oldMessages = await Message.find({
            chatId: chat._id,
            userId: req.user._id
        })
          .sort({ createdAt: 1, _id: 1 })
          .skip(chat.summarizedTillMessageNumber);

        const messagesForAI = buildMessagesForAI({
            chat,
            oldMessages,
            currentMessage: normalizedContent,
        });

        let aiResponse;
        try {
            aiResponse = await generateAiResponse({
                model: chat.model,
                messages: messagesForAI,
            });
        } catch (error) {
            console.error(
                "AI response generation failed:",
                error instanceof Error ? error.message : "Unknown OpenRouter error"
            );
            return res.status(502).json({
                message: "Unable to generate an AI reply right now. Please try again."
            });
        }
        const { aiReply, model: responseModel, usage } = aiResponse;
        
        const session = await mongoose.startSession();
        let committedResult;
        try {
            committedResult = await session.withTransaction(async () => {
                if (isNewChat) {
                    await chat.save({ session });
                }

                const [userMessage, assistantMessage] = await Message.create([
                    {
                        userId: req.user._id,
                        chatId: chat._id,
                        role: "user",
                        content: normalizedContent
                    },
                    {
                        userId: req.user._id,
                        chatId: chat._id,
                        role: "assistant",
                        content: aiReply
                    }
                ],{ session, ordered: true });

                const chatUpdate = {
                    $inc: {
                        messageCount: 2,
                        "usage.promptTokens": usage.promptTokens,
                        "usage.completionTokens": usage.completionTokens,
                        "usage.totalTokens": usage.totalTokens
                    },
                    $set: {
                        model: responseModel
                    }
                };
                if (chat.topic === "New Chat") {
                    chatUpdate.$set.topic = normalizedContent.slice(0, 30);
                }

                const chatResult = await Chat.updateOne(
                    { _id: chat._id, userId: req.user._id },
                    chatUpdate,
                    { session }
                );
                if (chatResult.matchedCount !== 1) {
                    throw new Error("Chat no longer exists");
                }

                const updatedUser = await User.findByIdAndUpdate(
                    req.user._id,
                    {
                        $inc: {
                            "usage.tokenUsed": usage.totalTokens,
                            "usage.totalTokenUsed": usage.totalTokens
                        }
                    },
                    { new: true, session }
                );
                if (!updatedUser) {
                    throw new Error("User no longer exists");
                }

                return {
                    userMessage,
                    assistantMessage,
                    tokenUsed: updatedUser.usage.tokenUsed
                };
            });
        } finally {
            try {
                await session.endSession();
            } catch (error) {
                console.error("MongoDB session cleanup failed:", error);
            }
        }

        let tokenUsed = committedResult.tokenUsed;
        try {
            tokenUsed = await redisClient.incrBy(
                req.tokenUsageKey,
                usage.totalTokens
            );

        } catch (error) {
            console.error("Redis token usage update failed after message commit:", error);
        }

        res.status(201).json({
            message: "Message sent successfully",
            chatId: chat._id,
            reply: aiReply,
            usage,
            tokenUsed,
            tokenLimit: req.user.usage.tokenLimit,
            userMessage: committedResult.userMessage,
            assistantMessage: committedResult.assistantMessage
        })

        updateSummaryIfNeeded(chat._id).catch((error) => {
            console.log("Summary update error:", error);
        });
        

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}
