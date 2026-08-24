import { createApp } from './app';
import { env } from './env';
import { logger } from './logger';
import { prisma } from './db';

async function main() {
  await prisma.$connect();
  logger.info('Database connected');

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

main().catch((err: unknown) => {
  logger.error('Fatal error during startup', err);
  process.exit(1);
});
