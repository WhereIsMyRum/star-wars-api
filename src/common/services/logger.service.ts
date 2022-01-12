export enum LoggingLevels {
  error,
  info,
  debug,
  critical,
}

export class LoggerService {
  static log(
    level: LoggingLevels,
    message: string,
    meta?: Record<string, unknown>,
  ) {
    let logValue = `[${level.toString().toUpperCase()}] ${message}.`;

    logValue = meta
      ? (logValue += ' ' + 'Metadata:' + JSON.stringify(meta))
      : logValue;

    if (process.env.NODE_ENV !== 'test') {
      console.log(logValue);
    }
  }
}
