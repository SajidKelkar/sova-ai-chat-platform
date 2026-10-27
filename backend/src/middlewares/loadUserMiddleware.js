import User from "../models/user.model.js";
import { resetUsageIfNeeded } from "../utils/userUsage.js";

const loadUserMiddleware = async (req, res, next) => {
    try {
        const existingUser = await User.findById(req.userId);

        if (!existingUser) {
            return res.status(404).json({
                message: "User doesn't exist"
            });
        }

        await resetUsageIfNeeded(existingUser);
        req.user = existingUser;

        next();
    } catch (error) {
        console.log("Load user error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export default loadUserMiddleware;