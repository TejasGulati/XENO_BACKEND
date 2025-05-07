const fs = require('fs');
const path = require('path');

// Check if .env file exists
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  // Copy .env.example to .env
  fs.copyFileSync(
    path.join(__dirname, '.env.example'),
    path.join(__dirname, '.env')
  );
  console.log('Created .env file from .env.example');
  console.log('Please update the MONGODB_URI in the .env file with your MongoDB connection string.');
} else {
  console.log('.env file already exists');
}

console.log('\nSetup completed! You can now run the following commands:');
console.log('- npm install  : to install dependencies');
console.log('- npm run dev  : to start the development server');
console.log('- npm start    : to start the production server');

console.log('\nRemember to:');
console.log('1. Update your MongoDB connection string in the .env file');
console.log('2. Install dependencies with npm install');
console.log('3. Start the server with npm run dev (development) or npm start (production)');