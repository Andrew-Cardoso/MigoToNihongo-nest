import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { generateHashAndSalt } from 'src/auth/utils/crypto';
import { uuid } from 'src/utils/functions/uuid-generator';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    if (await this.user.count()) return;

    const { passwordHash, passwordSalt } = await generateHashAndSalt(
      process.env.ADMIN_PASSWORD,
    );

    const admin: User = {
      id: uuid(),
      accountVerified: true,
      email: 'acceptcoins@gmail.com',
      name: 'Admin',
      passwordHash,
      passwordSalt,
      photo: null,
      signInType: 'LOCAL',
      roles: ['ADMIN'],
    };

    await this.user.create({ data: admin });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
