import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import logger from '../src/utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthvision';
const BACKUP_DIR = path.join(__dirname, '../backups');

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

logger.info(`Starting database backup to ${backupPath}...`);

// Use mongodump to create a backup
// Note: This requires mongodb-database-tools to be installed on the system
const command = `mongodump --uri="${MONGO_URI}" --out="${backupPath}"`;

exec('mongodump --version', (err) => {
    if (err) {
        logger.error('Error: "mongodump" command not found.');
        logger.info('Please install MongoDB Database Tools to use this script.');
        logger.info('Download link: https://www.mongodb.com/try/download/database-tools');
        return;
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            logger.error(`Backup failed: ${error.message}`);
            return;
        }
        if (stderr) {
            logger.warn(`Backup process output: ${stderr}`);
        }
        logger.info(`Backup completed successfully at ${backupPath}`);
        logger.info(stdout);
    });
});
