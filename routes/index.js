const express = require("express");
const router = express.Router();
const axios = require("axios");
const Debate = require("../models/Debate");

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

router.post("/debate", async (req, res) => {
    try {
        const { debateTopic, userSide, botSide, userMessage } = req.body;

        if (!debateTopic || !userSide || !botSide || !userMessage) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const requestData = {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `Debate topic: ${debateTopic}.
The user is arguing **${userSide}**.
If the user is speaking for the topic, then you can only ask questions to challenge the user's stance.
If the user is speaking against, then you can present your views on the topic and the user will ask question to challenge your stance.
Respond with a strong **${botSide}** argument or challenge questions to this statement: "${userMessage}".
Keep your response short (1-2 sentences maximum).`
                        }
                    ]
                }
            ],
            generationConfig: { 
                max_output_tokens: 300,
                stopSequences: []
            }
        };
        
        const response = await axios.post(GEMINI_API_URL, requestData, {
            headers: { "Content-Type": "application/json" }
        });

        console.log("✅ API Response:", JSON.stringify(response.data, null, 2)); 

        let botResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ AI failed to generate a response.";
        
        const debateEntry = new Debate({
            debateTopic,
            userSide,
            botSide,
            userMessage,
            botResponse
        });

        await debateEntry.save(); 

        res.json({ botResponse });
    } catch (error) {
        console.error("❌ API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to generate response." });
    }
});

module.exports = router;
