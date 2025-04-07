const fs = require('fs');

const examplePath = '.env.example';
const envPath = '.env';

if (fs.existsSync(envPath)) {
  console.log('.env already exists. Aborting to avoid overwrite.');
} else if (fs.existsSync(examplePath)) {
  fs.copyFileSync(examplePath, envPath);
  console.log('.env created from .env.example');
} else {
  console.error('.env.example not found.');
}
