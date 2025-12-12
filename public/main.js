//Author: Eric Guo
//date: 2025-01-30
//this is the client side javascript file for the chatbot
//date: 2025-02-14
//updated the new code for the chat history in client side local storage

// ✅ Function to load chat history for the selected model
function loadChatHistory() {
    const modelSelect = document.getElementById("model-select");
    const chatContainer = document.getElementById("chat-container");

    // ✅ Get the selected model
    const selectedModelValue = modelSelect.value;

    // ✅ Load history for this model
    let chatHistory = [];
    try {
        const stored = localStorage.getItem(`chatHistory_${selectedModelValue}`);
        chatHistory = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.warn("Failed to load chat history from localStorage:", error);
        chatHistory = [];
    }

    // ✅ Clear the chat box before loading history
    chatContainer.innerHTML = "";

    // ✅ Display stored messages
    chatHistory.forEach(message => {
        const roleLabel = message.role === "user" ? "You" : selectedModelValue;
        chatContainer.innerHTML += `<p class="${message.role}-message"><strong>${roleLabel}:</strong> ${message.content}</p>`;
    });
}

// ✅ Function to clear chat history for the selected model
function clearChatHistory() {
    const modelSelect = document.getElementById("model-select");
    const selectedModelValue = modelSelect.value;

    // ✅ Show a double confirmation before clearing
    const confirm1 = confirm(`Are you sure you want to clear the chat history for "${modelSelect.options[modelSelect.selectedIndex].text}"?`);
    if (!confirm1) return; // Stop if user clicks "Cancel"

    const confirm2 = confirm(`This action cannot be undone! Click "OK" to confirm.`);
    if (!confirm2) return; // Stop if user clicks "Cancel" again

    try {
        // ✅ Clear only the history of the selected model
        localStorage.removeItem(`chatHistory_${selectedModelValue}`);

        // ✅ Clear chat display
        document.getElementById("chat-container").innerHTML = "";

        alert(`Chat history for "${modelSelect.options[modelSelect.selectedIndex].text}" has been cleared.`);
    } catch (error) {
        console.error("Failed to clear chat history:", error);
        alert("Failed to clear chat history. Please check browser console.");
    }
}

// ✅ Load models dynamically from the server
async function loadModels() {
    const modelSelect = document.getElementById("model-select");
    console.log("Loading models...");
    try {
        const res = await fetch("/models"); // Fetch available models from server
        const models = await res.json();
        console.log("Models loaded:", models);
        
        // ✅ Populate the dropdown
        models.forEach(model => {
            const option = document.createElement("option");
            option.value = model.value;  // API model name
            option.textContent = model.title;  // Display name
            modelSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to load models:", error);
    }
}

// ✅ Initialize app when page loads
async function initializeApp() {
    await loadModels(); // Load models first
    loadChatHistory(); // Then load chat history for the default model

    // Add event listeners
    const sendBtn = document.getElementById("send-btn");
    const clearBtn = document.getElementById("clear-history-btn");
    const promptInput = document.getElementById("prompt");
    const modelSelect = document.getElementById("model-select");

    // Send button click
    sendBtn.addEventListener("click", askOllama);

    // Enter key press in input field
    promptInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            askOllama();
        }
    });

    // Clear history button click
    clearBtn.addEventListener("click", clearChatHistory);

    // Reload chat history when model changes
    modelSelect.addEventListener("change", loadChatHistory);
}

document.addEventListener("DOMContentLoaded", initializeApp);

async function askOllama() {
    const promptInput = document.getElementById("prompt");
    const modelSelect = document.getElementById("model-select");
    const chatContainer = document.getElementById("chat-container");
    const loadingIndicator = document.getElementById("loading-indicator");

    const prompt = promptInput.value.trim();
    const selectedModel = modelSelect.value;

    if (!prompt) return; // Avoid send empty messages

    //Get selected model value and title
    const selectedModelTitle = modelSelect.options[modelSelect.selectedIndex].text; // Get displayed title

    // ✅ Load chat history for the selected model
    let chatHistory = [];
    try {
        const stored = localStorage.getItem(`chatHistory_${selectedModel}`);
        chatHistory = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.warn("Failed to load chat history:", error);
        chatHistory = [];
    }

    // Show loading indicator
    loadingIndicator.style.display = "block";

    // Display user message
    chatContainer.innerHTML += `<p class="user-message"><strong>You:</strong> ${prompt}</p>`;
    chatContainer.scrollTop = chatContainer.scrollHeight;

    promptInput.value = ""; // Clear input field

    // ✅ Add user message to chat history
    chatHistory.push({ role: "user", content: prompt });

    try {
        const res = await fetch("/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, model: selectedModel })// Send model
        });

        const data = await res.json();

        // Hide loading indicator
        loadingIndicator.style.display = "none";

        // Display bot response
        chatContainer.innerHTML += `<p class="bot-message"><strong>${selectedModelTitle}:</strong> ${data.response}</p>`;
        chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to latest message

        // ✅ Add bot response to chat history for this model
        chatHistory.push({ role: "assistant", content: data.response });

        // ✅ Save updated history in `localStorage`
        try {
            localStorage.setItem(`chatHistory_${selectedModel}`, JSON.stringify(chatHistory));
        } catch (error) {
            console.error("Failed to save chat history:", error);
            // Continue - chat still works even if history fails to save
        }

    } catch (error) {
        // Hide loading indicator in case of error
        loadingIndicator.style.display = "none";

        // Display error message
        let errorMsg = "Could not connect to server.";
        if (error.response) {
            // Server responded with error
            errorMsg = error.response.data?.error || `Server error: ${error.response.status}`;
        } else if (error.request) {
            // Request made but no response
            errorMsg = "No response from server. Please check if the server is running.";
        }

        chatContainer.innerHTML += `<p class="bot-message"><strong>Error:</strong> ${errorMsg}</p>`;
        console.error("Request error:", error);
    }
}