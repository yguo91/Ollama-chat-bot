//author: Eric Guo
//Date: 2025-02-07
//Description: This is the main server file for the Ollama API. It serves the client-side files and provides an API endpoint to interact with Ollama.

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Load configuration from .env and generate config.generated.json
const config = require("./loadEnvConfig");

const { PORT, OLLAMA_URL, models } = config;
const DEFAULT_MODEL = models.length > 0 ? models[0].value : "qwen2.5:3b"; // Default model if none is specified

const app = express();

// Security headers with helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for simplicity
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:"],
        }
    }
}));

app.use(cors());
app.use(express.json());

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 requests per minute
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// ✅ Serve `index.html` for the root route
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Function to log requests (async)
async function logRequest(ip, question) {
    const date = new Date();
    const logFolder = path.join(__dirname, "logs");
    const logFileName = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}.log`;
    const logFilePath = path.join(logFolder, logFileName);

    // Sanitize question to prevent log injection
    const sanitizedQuestion = question.replace(/[\r\n]+/g, ' ').substring(0, 500);

    // Format log message
    const logMessage = `[${date.toISOString()}] IP: ${ip} | Question: ${sanitizedQuestion}\n`;

    try {
        // Ensure log folder exists
        await fs.promises.mkdir(logFolder, { recursive: true });

        // Append log instead of overwriting
        await fs.promises.appendFile(logFilePath, logMessage);

        // Print log to server console
        console.log(logMessage.trim());
    } catch (error) {
        console.error("Failed to write log:", error.message);
    }
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
app.post("/ask", apiLimiter, async (req, res) => {
    const { prompt, model } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        return res.status(400).json({ error: "Invalid or empty prompt" });
    }

    if (prompt.length > 10000) {
        return res.status(400).json({ error: "Prompt too long (max 10000 characters)" });
    }

    const selectedModel = model || DEFAULT_MODEL;

    // Validate model is in allowed list
    const allowedModels = models.map(m => m.value);
    if (model && !allowedModels.includes(selectedModel)) {
        return res.status(400).json({ error: "Invalid model selected" });
    }

    console.log(`Client requested model: ${selectedModel}`);

    const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Log request (async, but don't block the response)
    logRequest(clientIP, prompt).catch(err => console.error("Logging error:", err));

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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`${models.length} model(s) available`);
});
