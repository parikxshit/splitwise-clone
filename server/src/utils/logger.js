const { createLogger, format, transports } = require('winston');

const { combine, timestamp, colorize, printf, json } = format;

// Custom format for development
const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

// Format for production
const prodFormat = combine(
  timestamp(),
  json()
);

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    // Always log to console
    new transports.Console(),

    // Save error logs to file
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),

    // Save all logs to file
    new transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

module.exports = logger;