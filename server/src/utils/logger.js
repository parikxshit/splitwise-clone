const { createLogger, format, transports } = require('winston');

const { combine, timestamp, colorize, printf, json } = format;

// Extract filename and line number from stack trace
const addCallerInfo = format((info) => {
  const callerLine = new Error().stack.split('\n').find(line => 
    line.includes('.js:') && !line.includes('node_modules') && !line.includes('logger.js')
  );
  
  if (callerLine) {
    // Regex cleanly matches the path starting from 'server/' up to the line number
    const match = callerLine.match(/(server[/\\][^:]+:\d+)/);
    if (match) info.caller = match[1].replace(/\\/g, '/'); // Normalize slashes for consistency
  }
  return info;
});

// Custom format for development
const devFormat = combine(
  addCallerInfo(),
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, caller }) => {
    return `[${timestamp}] [${caller || 'unknown'}] ${level}: ${message}`;
  })
);

// Format for production
const prodFormat = combine(
  addCallerInfo(),
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