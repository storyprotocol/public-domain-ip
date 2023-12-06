import { createLogger, transports, format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logMsgFormat = format.printf(({ level, message, timestamp, stack }) => {
  if (stack) {
    return `${timestamp} ${level}: ${message}\n ${stack}`;
  }
  return `${timestamp} ${level}: ${message}`;
});

const createTransports = (
  level: string | undefined,
  fileName: string,
  logFolder: string = "logs"
): DailyRotateFile => {
  return new DailyRotateFile({
    filename: `uploadHandle-${fileName}-%DATE%.log`,
    level: level,
    datePattern: "YYYY-MM-DD",
    dirname: logFolder,
    auditFile: `${logFolder}/uploadHandle-${fileName}-audit.json`,
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "30d",
  });
};

export const fileLogger = createLogger({
  exitOnError: false,
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    logMsgFormat
  ),
  transports: [
    createTransports("info", "info"),
    createTransports("error", "error"),
  ],
  exceptionHandlers: [createTransports(undefined, "exceptions")],
  rejectionHandlers: [createTransports(undefined, "rejections")],
});

if (process.env.NODE_ENV !== "prod") {
  fileLogger.add(
    new transports.Console({
      format: format.combine(
        format.errors({ stack: true }),
        format.colorize(),
        format.timestamp(),
        logMsgFormat
      ),
    })
  );
}
