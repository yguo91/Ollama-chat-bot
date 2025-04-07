//author: Eric Guo
//Date: 2025-02-07
//Description: This is the main server file for the Ollama API. It serves the client-side files and provides an API endpoint to interact with Ollama.

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CONFIG_FILE = "config.generated.json"; // dynamic config

// Fallback to default config if .env is not yet loaded
let config = {
  PORT: 3000,
  OLLAMA_URL: "http://127.0.0.1:11434/api/generate",
  models: []
};

// Load generated config if available
if (fs.existsSync(CONFIG_FILE)) {
  config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
}

const { PORT, OLLAMA_URL, models } = config;
const DEFAULT_MODEL = models.length > 0 ? models[0].value : "qwen2.5:3b"; // Default model if none is specified

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve `index.html` for the root route
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Function to log requests
function logRequest(ip, question) {
    const date = new Date();
    const logFolder = path.join(__dirname, "logs");
    const logFileName = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}.log`;
    const logFilePath = path.join(logFolder, logFileName);
    
    // Format log message
    const logMessage = `[${date.toISOString()}] IP: ${ip} | Question: ${question}\n`;

    // Ensure log folder exists
    if (!fs.existsSync(logFolder)) {
        fs.mkdirSync(logFolder);
    }

    // Append log instead of overwriting
    fs.appendFileSync(logFilePath, logMessage, { flag: "a" });

    // Print log to server console
    console.log(logMessage.trim());
}
// ✅ New route to get available models from config.json
app.get("/models", (req, res) => {
    try {
        const models = config.models || []; // Get models list from config
        res.json(models);
    } catch (error) {
        res.status(500).json({ error: "Failed to load models" });
    }
});

// ✅ API Endpoint to Interact with Ollama
app.post("/ask", async (req, res) => {
    const { prompt, model } = req.body;
    const selectedModel = model || DEFAULT_MODEL; // Use default if no model is selected

    console.log(`Client requested model: ${selectedModel}`);

    const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress; // Get client IP

    //Log request
    logRequest(clientIP, prompt);

    try {
        const response = await axios.post(OLLAMA_URL, {
            model: selectedModel,
            prompt: prompt,
            stream: false,
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Failed to connect to Ollama" });
    }
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://${PORT}`);
    // console.log(`Using LLM model: ${MODEL_NAME}`);
});
