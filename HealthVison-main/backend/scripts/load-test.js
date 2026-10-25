import autocannon from 'autocannon';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import logger from '../src/utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const url = `http://localhost:${PORT}/api`;

const runLoadTest = () => {
    logger.info(`Starting load test on ${url}...`);

    const instance = autocannon({
        url,
        connections: 10, // default
        pipelining: 1, // default
        duration: 10 // seconds
    }, (err, result) => {
        if (err) {
            logger.error(`Load test failed: ${err.message}`);
            return;
        }
        logger.info('--- Load Test Result ---');
        logger.info(`URL: ${result.url}`);
        logger.info(`Total Requests: ${result.requests.total || result.requests.sent}`);
        logger.info(`Average Latency: ${result.latency.average} ms`);
        logger.info(`Max Latency: ${result.latency.max} ms`);
        logger.info(`Throughput: ${result.throughput.average} bytes/sec`);
        logger.info(`2xx responses: ${result['2xx']}`);
        logger.info(`Non-2xx responses: ${result.non2xx}`);
        logger.info('------------------------');
    });

    autocannon.track(instance, { renderProgressBar: true });
};

runLoadTest();
