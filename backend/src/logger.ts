import { env } from './env';
import winston from 'winston';

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.combine(winston.format.colorize({ all: true }), winston.format.simple()),
  ),
  transports: [new winston.transports.Console()],
});
