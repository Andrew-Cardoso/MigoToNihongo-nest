import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './utils/modules/prisma/prisma.module';
import { EmailModule } from './utils/modules/email/email.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    EmailModule,
    // CacheModule.register<RedisClientOptions>({
    //   store: redisStore,
    //   url: process.env.REDIS_URL,
    //   ttl: 600,
    //   isGlobal: true,
    // }),
    PostsModule,
    AdminModule,
  ],
})
export class AppModule {}
