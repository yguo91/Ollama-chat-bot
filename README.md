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

3. Run the server:

```bash
node server.js
```

## Folder Structure

```
OLLAMA-WEB/
├── public/              # Frontend files
│   ├── index.html
│   ├── main.css
│   ├── main.js
│   └── timer.gif
├── config.json          # Runtime config (structure only)
├── server.js            # Server logic
├── setup-env.js         # Script to create .env from example
├── .env.example         # Environment variable template
├── .gitignore
└── README.md
```
