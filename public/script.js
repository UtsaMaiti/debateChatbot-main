document.addEventListener("DOMContentLoaded", () => {
    const promptInput = document.getElementById("prompt");
    const submitButton = document.getElementById("submit");
    const chatContainer = document.querySelector(".chat-container");

    let debateTopic = "";
    let userSide = "";
    let botSide = "";

    function handleUserInput() {
        const userMessage = promptInput.value.trim();
        if (userMessage === "") return;

        displayMessage(userMessage, "user");
        promptInput.value = "";

        if (!debateTopic) {
            const { topic, side } = extractDebateDetails(userMessage);
            if (!topic || (side !== "for" && side !== "against")) {
                displayMessage("❌ Please specify the debate topic and whether you are speaking 'for' or 'against'.", "bot");
                return;
            }

            debateTopic = topic;
            userSide = side;
            botSide = userSide === "for" ? "against" : "for";

            displayMessage(`✔️ Debate Topic: <strong>${debateTopic}</strong><br>
                You are arguing <strong>${userSide.toUpperCase()}</strong>.<br>
                I will argue <strong>${botSide.toUpperCase()}</strong>. Let's start!`, "bot");
        } else {
            fetchBotResponse(userMessage);
        }
    }

    submitButton.addEventListener("click", handleUserInput);

    promptInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            handleUserInput();
        }
    });

    async function fetchBotResponse(userMessage) {
        try {
            const loadingMessage = displayMessage("🤖 AI is thinking...", "bot", true);
            const response = await fetch("/api/debate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ debateTopic, userSide, botSide, userMessage }),
            });
            chatContainer.removeChild(loadingMessage);
            const data = await response.json();
            console.log(data)
            displayMessage(data.botResponse || "⚠️ No response received. Try again!", "bot");
        } catch (error) {
            chatContainer.removeChild(loadingMessage);
            console.error("Error fetching AI response:", error);
            displayMessage("🚨 Error: Unable to connect to AI. Check API key or internet.", "bot");
        }
    }
    

    function extractDebateDetails(message) {
        const match = message.match(/The topic is (.+?) and I am speaking (for|against)/i);
        return match ? { topic: match[1], side: match[2].toLowerCase() } : { topic: "", side: "" };
    }

    function displayMessage(text, sender, isLoading = false) {
        const chatBox = document.createElement("div");
        chatBox.classList.add(sender === "user" ? "user-chat-box" : "ai-chat-box");

        const img = document.createElement("img");
        img.width = 70;
        img.alt = sender === "user" ? "User" : "AI";
        img.id = sender === "user" ? "userImage" : "aiImage";
        img.src = sender === "user" ? "user.jpeg" : "ai.jpeg";

        const messageDiv = document.createElement("div");
        messageDiv.classList.add(sender === "user" ? "user-chat-area" : "ai-chat-area");

        if (isLoading) {
            messageDiv.innerHTML = `<span class="loading-text">🤖 AI is thinking...</span>`;
            chatBox.classList.add("loading");
        } else {
            messageDiv.innerHTML = text;
        }

        chatBox.appendChild(img);
        chatBox.appendChild(messageDiv);
        chatContainer.appendChild(chatBox);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        return chatBox;
    }
});
