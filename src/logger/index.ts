import pino from 'pino';
import { loggerConfig } from './config';

export const logger = pino(loggerConfig);
