import { createLogger, transports, format } from 'winston';
import { LogSettings, LogLevel } from '../interfaces';
import { FileTransportOptions } from 'winston/lib/winston/transports';

export interface Logger {
  level: LogLevel;
  log(level: string, msg: string): void;
}

const customFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] ${message}`;
});

let logger: Logger;

function getTransport(fileOptions?: FileTransportOptions) {
  if (!fileOptions) {
    return new transports.Console();
  }
  return new transports.File(fileOptions);
}

export function initLogger(options: LogSettings[] = []): void {
  if (options.length === 0) {
    logger = {
      log: () => {},
      level: 'error',
    };
  }

  const opt = {
    level: options[0].level || 'error',
    transports: [getTransport(options[0].fileOptions)],
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      customFormat,
    ),
  };

  for (let i = 1; i < options.length; i++) {
    opt.transports.push(getTransport(options[i].fileOptions));
  }

  logger = logger || createLogger(opt) as Logger;
}

export function getLogger() {
  return logger;
}
