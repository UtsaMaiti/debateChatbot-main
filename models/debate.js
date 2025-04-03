const mongoose = require("mongoose");

const DebateSchema = new mongoose.Schema({
    debateTopic: { type: String, required: true },
    userSide: { type: String, required: true },
    botSide: { type: String, required: true },
    userMessage: { type: String, required: true },
    botResponse: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Debate", DebateSchema);
