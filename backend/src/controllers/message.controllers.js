import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { generateAiResponse } from "../service/openRouterService.js";
import { updateSummaryIfNeeded } from "../service/summaryService.js";
import { buildMessagesForAI } from "../utils/chatContext.js";
import { redisClient } from "../config/redis.js";

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

        const message = await Message.find({
            chatId: chatId,
            userId: req.user._id
        }).sort({ createdAt: 1 });

        // const message = await Message.find(
        // {
        //     chatId: chatId,
        //     userId: req.user._id
        // },
        // {
        //     role: 1,
        //     content: 1,
        //     _id: 0
        // }).sort({ createdAt: 1 });

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
    try{

        const {chatId} = req.params;
        const {content, model} = req.body;

        if(!content || content.trim() === ""){
            return res.status(400).json({
                message: "content required"
            })
        }

        let chat;
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

            if(!model){
                return res.status(400).json({
                    message: "model name required"
                })
            }
            chat = await Chat.create({
                userId: req.user._id,
                model,
                topic: content.trim().slice(0,30)
            })

        }

        const oldMessages = await Message.find({
            chatId: chat._id,           
        })
          .sort({ createdAt: 1 })
          .skip(chat.summarizedTillMessageNumber);

        const messagesForAI = buildMessagesForAI({
            chat,
            oldMessages,
            currentMessage: content.trim(),
        });

        const { aiReply, usage } = await generateAiResponse({
            model: chat.model,
            messages: messagesForAI,
        });
        
        const session = await mongoose.startSession();
        let committedResult;
        try {
            committedResult = await session.withTransaction(async () => {
                const [userMessage, assistantMessage] = await Message.create([
                    {
                        userId: req.user._id,
                        chatId: chat._id,
                        role: "user",
                        content: content.trim()
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
                    }
                };
                if (chat.topic === "New Chat") {
                    chatUpdate.$set = { topic: content.trim().slice(0, 30) };
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

            if (tokenUsed === usage.totalTokens) {
                await redisClient.expire(
                    req.tokenUsageKey,
                    Number(process.env.TOKEN_WINDOW_SECONDS)
                );
            }
        } catch (error) {
            console.error("Redis token usage update failed after message commit:", error);
        }

        res.status(201).json({
            message: "Message sent successfully",
            chatId: chat._id,
            reply: aiReply,
            usage,
            tokenUsed,
            tokenLimit: Number(process.env.TOKEN_LIMIT),
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
