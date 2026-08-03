import winston from 'winston';

const colorizer = winston.format.colorize();

// Custom format to match the "SENIOR" screenshot JSON format precisely, WITH colors!
const seniorFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const logObj = {
    timestamp,
    level: level.toUpperCase(),
    msg: message,
    ...meta,
  };

  // Convert to JSON string
  let jsonString = JSON.stringify(logObj);

  // Inject ANSI color into the "level" value for beautiful PM2/terminal output
  const coloredLevel = colorizer.colorize(level, `"${level.toUpperCase()}"`);
  jsonString = jsonString.replace(`"${level.toUpperCase()}"`, coloredLevel);

  return jsonString;
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
