import winston from 'winston';

// Custom format to match the "SENIOR" screenshot JSON format precisely
const seniorFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  return JSON.stringify({
    timestamp,
    level: level.toUpperCase(),
    msg: message,
    ...meta,
  });
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    seniorFormat
  ),
  transports: [
    new winston.transports.Console()
  ],
});

export default logger;
