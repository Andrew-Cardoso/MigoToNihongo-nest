import { CacheModule, Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './utils/modules/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { EmailModule } from './utils/modules/email/email.module';
import { RedisClientOptions } from 'redis';
import redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: process.env.REDIS_URL,
      ttl: 86400, // 24 horas
      isGlobal: true,
    }),
    PostsModule,
    AdminModule,
    EmailModule,
  ],
})
export class AppModule {}
