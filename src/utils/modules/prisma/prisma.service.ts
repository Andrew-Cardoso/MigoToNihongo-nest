import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { Roles } from 'src/auth/constants/roles';
import { generateHashAndSalt } from 'src/auth/utils/crypto';
import { uuid } from 'src/utils/functions/uuid-generator';
import { SMTP_CONFIG } from '../email/email.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    if (!(await this.role.count())) {
      const { passwordHash, passwordSalt } = await generateHashAndSalt(
        process.env.ADMIN_PASSWORD,
      );

      const admin: User = {
        id: uuid(),
        accountVerified: true,
        email: SMTP_CONFIG.user,
        name: 'Admin',
        passwordHash,
        passwordSalt,
        photo: null,
        signInType: 'LOCAL',
      };

      await this.user.create({ data: { ...admin, roles: { create: Roles } } });
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
