// packages/executor/src/logger.js
const winston = require('winston');

module.exports = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [executor] [${level}]: ${message}`)
  ),
  transports: [new winston.transports.Console()],
});
