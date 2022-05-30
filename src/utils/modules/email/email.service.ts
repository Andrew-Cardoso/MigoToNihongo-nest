import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import Mail from 'nodemailer/lib/mailer';
import NodeMailer from 'nodemailer';
import { uuid } from 'src/utils/functions/uuid-generator';
import { RedisIdEnum } from '../../functions/redis-id.generator';
import {
  confirmUserUpdate,
  resetPasswordTemplate,
  verificationEmailTemplate,
} from './email.templates';
import { User } from '@prisma/client';

type Message = Pick<Mail.Options, 'attachments' | 'subject' | 'to' | 'html'>;

@Injectable()
export class EmailService {
  private readonly transporter = Object.freeze(
    NodeMailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: +process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASS,
      },
      secure: true,
      tls: {
        rejectUnauthorized: true,
      },
    }),
  );

  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async sendVerificationEmail(name: string, email: string) {
    const token = uuid();
    await this.cacheManager.set(RedisIdEnum.verify(email), token);

    const to = email;
    const subject = 'Bem vindo ao Migo To Nihongo';
    const href = `${process.env.URL}/auth/verify-email?email=${email}&token=${token}`;
    const html = verificationEmailTemplate(name, href);

    return this.sendEmail({ to, subject, html });
  }

  async sendResetPasswordEmail(name: string, email: string) {
    const token = uuid();
    await this.cacheManager.set(RedisIdEnum.reset(email), token, { ttl: 1200 });

    const to = email;
    const subject = 'Redefinir senha - Migo To Nihongo';
    const href = `${process.env.FRONTEND_URL}/reset-password?email=${email}&resettoken=${token}`;
    const html = resetPasswordTemplate(name, href);

    return this.sendEmail({ to, subject, html });
  }

  async sendUpdateUserConfirmationEmail(user: User, data: Partial<User>) {
    const token = uuid();

    const to = user.email;
    const subject = 'Alteração de dados - Migo To Nihongo';
    const href = `${process.env.URL}/auth/confirm-update?email=${user.email}&token=${token}`;
    const keys: string[] = [];
    data.name && keys.push('nome');
    data.photo && keys.push('foto');
    data.passwordHash && keys.push('senha');
    const html = confirmUserUpdate(user.name, keys, href);

    const redisId = RedisIdEnum.update(user.email);
    const redisContent = {
      token,
      data,
    };

    return Promise.all([
      this.sendEmail({ to, subject, html }),
      this.cacheManager.set(redisId, JSON.stringify(redisContent)),
    ]);
  }

  private async sendEmail(message: Message) {
    return await this.transporter.sendMail({
      ...message,
      from: process.env.EMAIL_ADDRESS,
    });
  }
}
