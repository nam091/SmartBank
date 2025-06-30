/**
 * MongoDB Runner Script
 * 
 * This script provides commands to start, stop, and check the status of MongoDB.
 * It assumes MongoDB is installed on the local machine.
 */
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename);

// Configuration
const DATA_DIR = path.join(__dirname, '../../../', 'mongodb-data');
const LOG_DIR = path.join(__dirname, '../../../', 'mongodb-logs');
const LOG_FILE = path.join(LOG_DIR, 'mongodb.log');
const PORT = 27017;

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Created data directory: ${DATA_DIR}`);
}

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  console.log(`Created logs directory: ${LOG_DIR}`);
}

// Command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';

function runCommand(cmd, callback) {
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    callback(stdout);
  });
}

switch (command) {
  case 'start':
    console.log('Starting MongoDB...');
    const startCmd = `mongod --dbpath "${DATA_DIR}" --port ${PORT} --logpath "${LOG_FILE}"`;
    runCommand(startCmd, (stdout) => {
      console.log('MongoDB started successfully.');
      console.log(`Data directory: ${DATA_DIR}`);
      console.log(`Log file: ${LOG_FILE}`);
      console.log(`Port: ${PORT}`);
    });
    break;

  case 'stop':
    console.log('Stopping MongoDB...');
    const stopCmd = process.platform === 'win32'
      ? `taskkill /F /IM mongod.exe`
      : `pkill mongod`;
    runCommand(stopCmd, (stdout) => {
      console.log('MongoDB stopped successfully.');
    });
    break;

  case 'status':
    console.log('Checking MongoDB status...');
    const statusCmd = process.platform === 'win32'
      ? `tasklist /FI "IMAGENAME eq mongod.exe"`
      : `ps aux | grep mongod`;
    runCommand(statusCmd, (stdout) => {
      if (stdout.includes('mongod')) {
        console.log('MongoDB is running.');
      } else {
        console.log('MongoDB is not running.');
      }
    });
    break;

  case 'help':
  default:
    console.log(`
MongoDB Runner Script
Usage: node runMongoDB.js [command]

Commands:
  start   - Start the MongoDB server
  stop    - Stop the MongoDB server
  status  - Check if MongoDB is running
  help    - Show this help message
`);
} 