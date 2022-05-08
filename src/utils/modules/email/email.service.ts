import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import NodeMailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

type Message = Pick<Mail.Options, 'attachments' | 'subject' | 'to' | 'html'>;
// TODO Response Sample //
// {
//   "accepted": [
//     "andrewgcardoso@gmail.com"
//   ],
//   "rejected": [],
//   "envelopeTime": 870,
//   "messageTime": 1023,
//   "messageSize": 286,
//   "response": "250 2.0.0 OK  1651926930 d15-20020a05683025cf00b0060603221278sm2555636otu.72 - gsmtp",
//   "envelope": {
//     "from": "",
//     "to": [
//       "andrewgcardoso@gmail.com"
//     ]
//   },
//   "messageId": "<bb53df2f-4d7c-ac41-61af-67c9d209bf0e@Nika>"
// }
// const REFRESH_TOKEN =
//   '1//04y43Fgc6yfXMCgYIARAAGAQSNwF-L9IrvsHewGi9pSDo9EE9qm95KZN19Gkt87I9awIiYxGcSYd4PGEoHD6ayGxS1Ctx2LXGizA';

// const oAuthClient = new google.auth.OAuth2(
//   process.env.OAUTH_CLIENT_ID,
//   process.env.OAUTH_CLIENT_SECRET,
//   'https://developers.google.com/oauthplayground/',
// );

// oAuthClient.setCredentials({ refresh_token: REFRESH_TOKEN });

// const transport = nodemailer.createTransport("SMTP", {
//   service: "hotmail",
//   auth: {
//       user: "user@outlook.com",
//       pass: "password"
//   }
// });
const createTransporter = () =>
  NodeMailer.createTransport(
    {
      host: 'smtp.hostinger.com',
      port: 465,
      auth: {
        user: 'noreply@migotonihongo.com.br',
        pass: '7cNBrENwKKQ2jZX7==y%b!nv#3n?ttP&=Npyv@dYqSwB$JnT+8',
      },
    },
    //   {
    //   host: process.env.SMTP_HOST,
    //   port: +process.env.SMTP_PORT,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS,
    //   },
    //   tls: {
    //     rejectUnauthorized: false,
    //   },
    //   secure: false,
    // }
  );

@Injectable()
export class EmailService {
  private readonly transporter = Object.freeze(createTransporter());

  constructor() {}

  async sendEmail(message: Message) {
    // const accessToken = await oAuthClient.getAccessToken();

    // console.log(accessToken);

    // const transporter = (NodeMailer as any).createTransport({
    //   service: 'gmail',
    //   auth: {
    //     type: 'OAuth2',
    //     user: process.env.SMTP_USER,
    //     clientId: process.env.OAUTH_CLIENT_ID,
    //     clientSecret: process.env.OAUTH_CLIENT_SECRET,
    //     refreshToken: REFRESH_TOKEN,
    //     accessToken,
    //   },
    // });

    const mailOptions: Mail.Options = {
      ...message,
      from: 'Migoto Nihongo',
    };
    console.log('sending');
    return await this.transporter.sendMail(mailOptions);
  }
}
