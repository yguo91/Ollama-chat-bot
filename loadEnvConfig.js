require('dotenv').config();
const fs = require('fs');

// Load environment variables and build models array
const models = [];
for (let i = 1; i <= 20; i++) { // Support up to 20 models (expandable)
  const modelValue = process.env[`MODEL_${i}`];
  const modelTitle = process.env[`TITLE_${i}`];

  // Only add model if both value and title are defined
  if (modelValue && modelTitle) {
    models.push({ value: modelValue, title: modelTitle });
  }
}

const config = {
  PORT: process.env.PORT || 3000,
  OLLAMA_URL: process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate",
  models: models
};

// Save the config object to a JSON file
fs.writeFileSync('config.generated.json', JSON.stringify(config, null, 2));
console.log(`✅ Config loaded from .env: ${models.length} model(s) configured`);

// Export config for use in server.js
module.exports = config;
