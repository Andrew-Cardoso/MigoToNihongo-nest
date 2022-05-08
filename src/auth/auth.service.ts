import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, SignInType, User } from '@prisma/client';
import { badRequest, unauthorized } from 'src/utils/functions/error-handler';
import { getDateNow } from 'src/utils/functions/temporal';
import { uuid } from 'src/utils/functions/uuid-generator';
import { EmailService } from 'src/utils/modules/email/email.service';
import { PrismaService } from 'src/utils/modules/prisma/prisma.service';
import { UserSignUpDto } from './dtos/user-sign-up.dto';
import { GoogleUser } from './types/google-user';
import { checkPassword, generateHashAndSalt } from './utils/crypto';

const getSignInType = (signInType: SignInType) =>
  signInType.charAt(0) + signInType.substring(1).toLowerCase();

@Injectable()
export class AuthService {
  constructor(
    // @Inject(CACHE_MANAGER)
    // private cacheManager: Cache,
    // private emailService: EmailService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // async teste() {
  //   console.log('truing');
  //   try {
  //     const response = await this.emailService.sendEmail({
  //       html: '<h1>Email from google gmailApi</h1>',
  //       subject: 'migoto nihongo gmail api',
  //       to: 'andrewgcardoso@gmail.com',
  //     });

  //     console.log('sent');

  //     console.log(response);

  //     return response;
  //   } catch (error) {
  //     console.log(error);
  //     return error;
  //   }
  // }

  async signInLocal(email: string, password: string) {
    const user = await this.getUser(email);

    if (!user) unauthorized('Não autorizado', 'Usuário ou senha inválidos');

    if (user.signInType !== 'LOCAL') {
      const signInType = getSignInType(user.signInType);
      unauthorized(
        `Conta vinculada ao ${signInType}`,
        `por favor entre com o ${signInType}.`,
      );
    }

    const isPasswordCorrect = await checkPassword(
      password,
      user.passwordHash,
      user.passwordSalt,
    );

    if (!isPasswordCorrect)
      unauthorized('Não autorizado', 'Usuário ou senha inválidos');

    // if (!user.accountVerified)
    //   unauthorized(
    //     'Email não confirmado',
    //     'Se não recebeu o email de verificação clique em "Reenviar email de verificação" e não esqueça de verificar sua caixa de spam',
    //   );

    return await this.createJwtToken(user);
  }

  async signUpLocal({ email, name, password, photo }: UserSignUpDto) {
    const createdUser = await this.getUser(email);
    if (createdUser) {
      const signInType = getSignInType(createdUser.signInType);
      badRequest(
        'Email já cadastrado',
        createdUser.signInType === 'LOCAL'
          ? 'Se esquceu sua senha clique em "Esqueci minha senha"'
          : `Sua conta está vinculada ao ${signInType}, por favor entre com o ${signInType}.`,
      );
    }

    const { passwordHash, passwordSalt } = await generateHashAndSalt(password);
    const user = await this.prisma.user.create({
      data: {
        id: uuid(),
        email,
        name,
        passwordHash,
        passwordSalt,
        photo,
        signInType: 'LOCAL',
        roles: [],
      },
    });

    // await this.sendVerificationEmail(name, email);
    return await this.createJwtToken(user);
  }

  // async checkUserAndSendVerificationEmail(email: string, password: string) {
  //   const user = await this.validCredentials(email, password);

  //   if (!user) unauthorized('Invalid email or password');

  //   return await this.sendVerificationEmail(user.name, user.email);
  // }

  // async verifyUser(email: string, token: string) {
  //   const user = await this.getUser(email);

  //   if (!user)
  //     throw new NotFoundException('Email not found, do you have an account?');

  //   if (user.accountVerified)
  //     badRequest('Your email has already been verified.');

  //   const cachedToken: string = await this.cacheManager.get(email);

  //   if (cachedToken !== token)
  //     throw new GoneException(
  //       'Your token has expired. Please, send another one to your email',
  //     );

  //   await Promise.all([
  //     this.prisma.user.update({
  //       where: { email },
  //       data: { accountVerified: true },
  //     }),
  //     this.cacheManager.del(email),
  //   ]);

  //   return await this.createJwtToken(email, user.name, user.roles);
  // }

  private async createJwtToken({
    email,
    name,
    roles,
    photo,
  }: User & { roles: Role[] }) {
    const isAdmin = roles.includes('ADMIN');
    const expirationDate = getDateNow().add(
      isAdmin ? { hours: 1 } : { days: 7 },
    );
    const token = await this.jwtService.signAsync(
      {
        sub: email,
        name,
        roles,
        photo,
        expirationDate: expirationDate.toString(),
      },
      {
        expiresIn: isAdmin ? '1h' : '7d',
      },
    );
    return { token };
  }

  private getUser(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async signInGoogle(googleUser: GoogleUser) {
    const dbUser = await this.getUser(googleUser.email);

    if (dbUser) {
      if (dbUser.signInType === 'FACEBOOK')
        unauthorized(
          'Forma de login inválida',
          `Sua conta está vinculada ao Facebook, por favor entre com o Facebook.`,
        );

      if (dbUser.signInType === 'LOCAL')
        unauthorized(
          'Forma de login inválida',
          `Sua conta foi criada pelo Migo To Nihongo, por favor entre email e senha.`,
        );

      return this.createJwtToken(dbUser);
    }

    const user = await this.prisma.user.create({
      data: {
        id: uuid(),
        email: googleUser.email,
        name: googleUser.name,
        photo: googleUser.photo,
        accountVerified: googleUser.verified,
        signInType: 'GOOGLE',
      },
    });

    return this.createJwtToken(user);
  }
  // private async sendVerificationEmail(name: string, email: string) {
  //   const token = uuid();
  //   await this.cacheManager.set(email, token);
  //   return this.emailService.sendEmail({
  //     to: email,
  //     subject: 'Migo To Nihongo',
  //     html: `
  //     <h3>Bem vindo ${name}</h3>
  //     <p>
  //       Se foi voce que criou a conta, por favor
  //       <a href="http://localhost:3000/auth/verify-user?email=${email}&token=${token}">
  //         clique aqui
  //       </a>
  //       para verificar seu email.
  //       Nota: <strong>Este botao ficara disponivel apenas nos proximos 10 minutos<strong>
  //       <br>
  //       Se nao foi voce que criou a conta, ignore este email.
  //     </p>
  //     `,
  //   });
  // }
}
