import { LoggerOptions } from 'pino';

export const loggerConfig: LoggerOptions = {
    level: 'debug',
    transport: {
        target: 'pino-pretty'
    }
};
