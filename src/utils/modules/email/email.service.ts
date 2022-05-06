import { Injectable } from '@nestjs/common';
import NodeMailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { SMTP_CONFIG } from './email.config';

type Message = Pick<Mail.Options, 'attachments' | 'subject' | 'to' | 'html'>;

const createTransporter = () => {
  const { host, port, pass, user } = SMTP_CONFIG;
  return NodeMailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    secure: false,
  });
};

@Injectable()
export class EmailService {
  private readonly transporter = Object.freeze(createTransporter());

  constructor() {}

  async sendEmail(message: Message) {
    const mailOptions: Mail.Options = {
      ...message,
      from: 'Migo To Nihongo',
    };
    return this.transporter.sendMail(mailOptions);
  }
}
