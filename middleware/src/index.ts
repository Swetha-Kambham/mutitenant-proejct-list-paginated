import dotenv from 'dotenv';
import { initRedis } from './redis/redisClient';
import { startServer } from './server';

// Load environment variables
dotenv.config();

async function bootstrap() {
  try {
    console.log('🔧 Starting PSA GraphQL Middleware...');

    // Init Redis
    await initRedis();
    console.log('✅ Connected to Redis');

    // Start HTTP + GraphQL server
    await startServer();

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

bootstrap();
