import mongoose from "mongoose";
import { TOKEN_LIMIT, TOKEN_WINDOW_SECONDS } from "../config/usage.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },

  usage: {
    tokenUsed: {
      type: Number,
      default: 0
    },
    tokenLimit: {
      type: Number,
      default: TOKEN_LIMIT
    },
    resetAt: {
      type: Date,
      default: () => new Date(Date.now() + TOKEN_WINDOW_SECONDS * 1000)
    },
    totalTokenUsed: {
      type: Number,
      default: 0
    }
    
  }
  
},{timestamps: true});

const User = mongoose.model("User",userSchema);

export default User;