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
    let chatHistory = JSON.parse(localStorage.getItem(`chatHistory_${selectedModelValue}`)) || [];

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

    // ✅ Clear only the history of the selected model
    localStorage.removeItem(`chatHistory_${selectedModelValue}`);

    // ✅ Clear chat display
    document.getElementById("chat-container").innerHTML = "";

    alert(`Chat history for "${modelSelect.options[modelSelect.selectedIndex].text}" has been cleared.`);
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

// ✅ Run model loading when the page loads
document.addEventListener("DOMContentLoaded", loadModels);

//the original code for basic chat
function handleKeyPress(event) {
    if (event.key === "Enter") {
        askOllama();
    }
}

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
    let chatHistory = JSON.parse(localStorage.getItem(`chatHistory_${selectedModel}`)) || [];

    // Show loading indicator
    loadingIndicator.style.display = "block";

    // Display user message
    chatContainer.innerHTML += `<p class="user-message"><strong>You:</strong> ${prompt}</p>`;
    chatContainer.scrollTop = chatContainer.scrollHeight;

    promptInput.value = ""; // Clear input field

    // ✅ Add user message to chat history
    chatHistory.push({ role: "user", content: prompt });

    try {
        const res = await fetch("http://10.0.0.128:3000/ask", {
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
        localStorage.setItem(`chatHistory_${selectedModel}`, JSON.stringify(chatHistory));

    } catch (error) {
        // Hide loading indicator in case of error
        loadingIndicator.style.display = "none";

        chatContainer.innerHTML += `<p class="bot-message"><strong>Error:</strong> Could not connect to Ollama.</p>`;
        console.error(error);
    }
}

// ✅ Reload chat history when model changes
document.getElementById("model-select").addEventListener("change", loadChatHistory);

// ✅ Load chat history when page loads
document.addEventListener("DOMContentLoaded", loadChatHistory);