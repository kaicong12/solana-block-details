import { Module } from '@nestjs/common';
import { SolanaModule } from './solana/solana.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

console.log({ host: process.env.REDIS_HOST });
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
          password: process.env.REDIS_PASSWORD,
        }),
      }),
    }),
    SolanaModule,
  ],
})
export class AppModule {}
