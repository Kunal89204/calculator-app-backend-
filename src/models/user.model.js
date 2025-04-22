import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true }, // e.g., "User1" or "User2"
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export const Message = mongoose.model("Message", messageSchema);
