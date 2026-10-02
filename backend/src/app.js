import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.set("trust proxy", 1);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "AI Chat API is running"
    });
});

import userRouter from "./routes/user.route.js";
import chatRouter from "./routes/chat.route.js";
import messageRouter from "./routes/message.route.js";


app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);


export default app;