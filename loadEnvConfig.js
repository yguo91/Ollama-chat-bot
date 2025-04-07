require('dotenv').config();
const fs = require('fs');

// Load environment variables
const config = {
  PORT: process.env.PORT,
  OLLAMA_URL: process.env.OLLAMA_URL,
  models: [
    { value: process.env.MODEL_1, title: process.env.TITLE_1 },
    { value: process.env.MODEL_2, title: process.env.TITLE_2 },
    { value: process.env.MODEL_3, title: process.env.TITLE_3 },
    { value: process.env.MODEL_4, title: process.env.TITLE_4 },
    { value: process.env.MODEL_5, title: process.env.TITLE_5 }
  ]
};

// Save the config object to a JSON file (optional)
fs.writeFileSync('config.generated.json', JSON.stringify(config, null, 2));
console.log('Config loaded from .env and written to config.generated.json');
