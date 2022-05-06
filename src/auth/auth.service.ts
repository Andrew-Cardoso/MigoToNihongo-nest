import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, SignInType, User } from '@prisma/client';
import { getDateNow } from 'src/utils/functions/temporal';
import { uuid } from 'src/utils/functions/uuid-generator';
import { PrismaService } from 'src/utils/modules/prisma/prisma.service';
import { RolesEnum } from './constants/roles';
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
  ) {}

  async signInLocal(email: string, password: string) {
    const user = await this.getUser(email);

    if (!user)
      throw new UnauthorizedException(
        'Usuário nao encontrado, por favor crie uma conta ou entre pelo google',
      );

    if (user.signInType !== 'LOCAL') {
      const signInType = getSignInType(user.signInType);
      throw new UnauthorizedException(
        `Sua conta está vinculada ao ${signInType}, por favor entre com o ${signInType}.`,
      );
    }

    const isPasswordCorrect = await checkPassword(
      password,
      user.passwordHash,
      user.passwordSalt,
    );

    if (!isPasswordCorrect) throw new UnauthorizedException('Senha incorreta');

    // if (!user.accountVerified)
    //   throw new UnauthorizedException(
    //     `Por favor, verifique o seu email antes de entrar.
    //     Se voce nao recebeu o email por favor clique no botao "Enviar email de verificacao"
    //     e lembre-se de olhar a caixa de spam.`,
    //   );

    return await this.createJwtToken(user);
  }

  async signUpLocal({ email, name, password, photo }: UserSignUpDto) {
    const createdUser = await this.getUser(email);
    if (createdUser) {
      const signInType = getSignInType(createdUser.signInType);
      throw new BadRequestException(
        createdUser.signInType === 'LOCAL'
          ? 'Email já cadastrado'
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
      },
      include: { roles: true },
    });

    return await this.createJwtToken(user);

    // await this.sendVerificationEmail(name, email);
  }

  // async checkUserAndSendVerificationEmail(email: string, password: string) {
  //   const user = await this.validCredentials(email, password);

  //   if (!user) throw new UnauthorizedException('Invalid email or password');

  //   return await this.sendVerificationEmail(user.name, user.email);
  // }

  // async verifyUser(email: string, token: string) {
  //   const user = await this.getUser(email);

  //   if (!user)
  //     throw new NotFoundException('Email not found, do you have an account?');

  //   if (user.accountVerified)
  //     throw new BadRequestException('Your email has already been verified.');

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
    const isAdmin = roles.some(
      (role) => role.id === RolesEnum[RolesEnum.ADMIN],
    );
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
      include: { roles: true },
    });
  }

  async signInGoogle(googleUser: GoogleUser) {
    const dbUser = await this.getUser(googleUser.email);

    if (dbUser) {
      if (dbUser.signInType === 'FACEBOOK')
        throw new UnauthorizedException(
          `Sua conta está vinculada ao Facebook, por favor entre com o Facebook.`,
        );

      if (dbUser.signInType === 'LOCAL')
        throw new UnauthorizedException(
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
      include: { roles: true },
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
