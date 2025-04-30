import { LoggerOptions } from 'pino';

export const loggerConfig: LoggerOptions = {
    transport: {
        target: 'pino-pretty'
    }
};
