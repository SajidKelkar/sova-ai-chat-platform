import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";

const userAuthMiddleware = async (req,res,next) => {
    try{

        const {token} = req.cookies;
        if(!token){
            return res.status(401).json({
                message: "You need to login first"
            })
        }

        const blockedToken = await redisClient.get(
            `blocklist:${token}`
        );

        if (blockedToken) {
            return res.status(401).json({
                message: "Please login again"
            });
        }

        let payload;
        try{
            payload = jwt.verify(token,process.env.JWT_SECRET);
        }catch(err){
            return res.status(401).json({
                message: "token not valid"
            })
        }

        req.userId = payload.id;
        req.token = token;
        req.tokenPayload = payload;

        next();

    }catch(err){
        if (
            err.name === "JsonWebTokenError" ||
            err.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }
        console.log(err);
        res.status(500).json({
            message: "internal server error"
        })
    }
}


export default userAuthMiddleware;