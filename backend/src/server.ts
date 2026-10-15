import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import prisma from './config/prisma';

async function start() {
  // Start HTTP server first — don't block on DB
  const server = app.listen(env.PORT, () => {
    logger.info(`✓ CertiChain API running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`  Health: http://localhost:${env.PORT}/health`);
    logger.info(`  API:    http://localhost:${env.PORT}/api`);
  });

  // Attempt DB connection in background — log error but keep server alive
  prisma.$connect()
    .then(() => logger.info('✓ Database connected'))
    .catch((err: any) => {
      logger.error('⚠ Database connection failed — API is running but DB calls will fail:', {
        message: err?.message,
        hint: 'If using Supabase free tier, unpause the project at app.supabase.com. For local dev, start Docker: docker-compose -f docker-compose.dev.yml up -d',
      });
    });

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received — shutting down gracefully');
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
