# OLLAMA-Chat-Bot

A web-based AI chatbot demo using OLLAMA and Node.js.

## Features

- Backend powered by customizable AI models via OLLAMA
- .env support for environment-specific configurations
- Easy deployment with setup script
- Client questions are logged server-side with timestamp and IP
- Dialog history is stored client-side in browser memory (JavaScript)

## Pre-install: OLLAMA

Before running this project, make sure you have Ollama installed and running on your machine.

Download and install Ollama from the official site: https://ollama.com

Start a model (e.g., Qwen or Mistral):
```bash
ollama run qwen:1.5b
```

Ollama runs locally on port 11434 by default. This is used as the base URL in your .env file:
```bash
OLLAMA_URL=http://127.0.0.1:11434/api/generate
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from the example:

```bash
node setup-env.js
```

Or manually copy `.env.example` to `.env` and edit it with your preferred models.

3. Configure your models in `.env`:

```bash
# You can add up to 20 models. Only models with both MODEL_X and TITLE_X will be loaded.
MODEL_1=qwen2.5:3b
TITLE_1=Qwen 2.5 (3B)

MODEL_2=llama3.2:3b
TITLE_2=Llama 3.2 (3B)
```

**To sync with your installed Ollama models:**
```bash
# List your installed models
ollama list

# Then add them to .env as MODEL_X and TITLE_X pairs
```

4. Run the server:

```bash
node server.js
```

The configuration is automatically loaded from `.env` on startup and saved to `config.generated.json`.

5. Access the chatbot:
- **Local:** `http://127.0.0.1:3000` or `http://localhost:3000`
- **LAN:** `http://[your-ip]:3000` (e.g., `http://10.0.0.128:3000`)

To find your IP: `ipconfig` (Windows) or `ifconfig` (Linux/Mac)

## Folder Structure

```
OLLAMA-WEB/
├── public/                  # Frontend files
│   ├── index.html
│   ├── main.css
│   ├── main.js
│   └── timer.gif
├── logs/                    # Request logs (auto-generated)
├── loadEnvConfig.js         # Loads .env and generates config JSON
├── config.generated.json    # Runtime config (auto-generated)
├── server.js                # Server logic
├── setup-env.js             # Script to create .env from example
├── .env.example             # Environment variable template
├── .env                     # Your actual config (create from .env.example)
├── .gitignore
└── README.md
```
