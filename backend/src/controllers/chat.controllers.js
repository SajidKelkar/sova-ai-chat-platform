import Chat from "../models/chat.model.js"
import Message from "../models/message.model.js";
import { isAllowedModel } from "../config/models.js";
import mongoose from "mongoose";


export const createChat = async (req,res)=>{
    try{

        const {model} = req.body || {};
        if(typeof model !== "string" || !isAllowedModel(model.trim())){
            return res.status(400).json({
                message: "model is missing or not enabled for this application"
            })
        }

        const createdChat = await Chat.create({
            userId: req.user._id,
            model: model.trim()
        })

        res.status(200).json({
            message: "chat created successfully",
            chatId: createdChat._id,
            userId: req.user._id,
            model: model.trim(),
            topic: createdChat.topic,
            createdAt: createdChat.createdAt
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "internal server error"
        })
    }
}

export const deleteChat = async (req,res)=>{
    try{

        const {chatId} = req.params;

        if(!chatId){
            return res.status(409).json({
                message: "chatId not provided"
            })
        }

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                message: "chat id not valid"
            });
        }

        const userChat = await Chat.findOne({_id: chatId, userId: req.user._id});
        if(!userChat){
            return res.status(404).json({
                message: "chat not found"
            })
        }

        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                await Message.deleteMany({
                    chatId: userChat._id,
                    userId: req.user._id
                }, { session });

                const result = await Chat.deleteOne({
                    _id: chatId,
                    userId: req.user._id
                }, { session });

                if (result.deletedCount !== 1) {
                    throw new Error("Chat no longer exists");
                }
            });
        } finally {
            try {
                await session.endSession();
            } catch (error) {
                console.error("MongoDB session cleanup failed:", error);
            }
        }

        res.status(200).json({
            message: "Your chat is deleted"
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "internal server error"
        })
    }
}

export const getRecentChats = async (req,res)=>{
    try{

        const getChat = await Chat.find({ userId: req.user._id}).select("topic updatedAt").sort({ updatedAt: -1}).limit(20);

        res.status(200).json({
            message: "recent chats fetched successfully",
            chats: getChat
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "internal server error"
        })
    }
}

export const getSingleChat = async (req,res)=>{
    try{

        const {chatId} = req.params;

        if(!chatId){
            return res.status(409).json({
                message: "chatId not provided"
            })
        }

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                message: "chat id not valid"
            });
        }

        const userChat = await Chat.findOne({ _id: chatId, userId: req.user._id});
        if(!userChat){
            return res.status(404).json({
                message: "Chat not found"
            })
        }

        res.status(200).json({
            chatId: userChat._id,
            userId: userChat.userId,
            topic: userChat.topic,
            usage: userChat.usage
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "internal server error"
        })
    }
}