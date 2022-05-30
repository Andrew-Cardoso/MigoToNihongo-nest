import {
  BadRequestException,
  CACHE_MANAGER,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignInType, User } from '@prisma/client';
import { Cache } from 'cache-manager';
import { getDateNow } from 'src/utils/functions/temporal';
import { uuid } from 'src/utils/functions/uuid-generator';
import { EmailService } from 'src/utils/modules/email/email.service';
import { PrismaService } from 'src/utils/modules/prisma/prisma.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserSignUpDto } from './dtos/user-sign-up.dto';
import { GoogleUser } from './types/google-user';
import { checkPassword, generateHashAndSalt } from './utils/crypto';
import {
  RedisIdEnum,
  RedisIdTypes,
} from 'src/utils/functions/redis-id.generator';

const getSignInType = (signInType: SignInType) =>
  signInType.charAt(0) + signInType.substring(1).toLowerCase();

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signInLocal(email: string, password: string) {
    const user = await this.getUser(email);

    if (!user) throw new UnauthorizedException('Email ou senha inválidos');

    if (user.signInType !== 'LOCAL') {
      const signInType = getSignInType(user.signInType);
      throw new UnauthorizedException(
        `Sua conta está vinculada ao ${signInType}, por favor entre com o ${signInType}`,
      );
    }

    if (!user.accountVerified) {
      const hasToken = await this.tokenExists('verify', user.email);
      if (hasToken)
        throw new UnauthorizedException(
          'Seu email ainda não foi confirmado. Por favor, procure em sua caixa de entrada e spam o nosso email de verificação e siga as instruções',
        );

      await this.emailService.sendVerificationEmail(user.name, user.email);
      throw new UnauthorizedException(
        `Acabamos de reenviar um email de verificação para ${user.email}, verique sua caixa de entrada e spam e siga as instruções.`,
      );
    }

    await this.validatePassword(password, user);

    return await this.createJwtToken(user);
  }

  async getUserImage(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { photo: true },
    });

    if (user) return { photo: user.photo };

    throw new UnauthorizedException('Ocorreu um erro ao buscar sua conta');
  }

  async signUpLocal({ email, name, password, photo }: UserSignUpDto) {
    const createdUser = await this.getUser(email);
    if (createdUser) {
      const signInType = getSignInType(createdUser.signInType);
      throw new BadRequestException(
        createdUser.signInType === 'LOCAL'
          ? 'Email já cadastrado'
          : `Sua conta está vinculada ao ${signInType}, por favor entre com o ${signInType}`,
      );
    }

    const { passwordHash, passwordSalt } = await generateHashAndSalt(password);
    await this.prisma.user.create({
      data: {
        id: uuid(),
        email,
        name,
        passwordHash,
        passwordSalt,
        photo,
        signInType: 'LOCAL',
        roles: [],
        accountVerified: false,
      },
    });

    await this.emailService.sendVerificationEmail(name, email);
  }

  async signInGoogle(googleUser: GoogleUser) {
    const dbUser = await this.getUser(googleUser.email);

    if (dbUser) {
      if (dbUser.signInType === 'FACEBOOK')
        throw new UnauthorizedException(
          `Sua conta está vinculada ao Facebook, por favor entre com o Facebook`,
        );

      if (dbUser.signInType === 'LOCAL')
        throw new UnauthorizedException(
          `Sua conta foi criada pelo Migo To Nihongo, por favor entre com email e senha`,
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
        roles: [],
      },
    });

    return this.createJwtToken(user);
  }

  async verifyEmail(email: string, token: string) {
    if (!email) throw new NotFoundException('Email não encontrado');

    email = `${email}`.toLowerCase();

    const user = await this.getUser(email);

    if (!user) throw new NotFoundException('Email não encontrado');

    if (user.accountVerified)
      throw new BadRequestException('Seu email já foi verificado');

    const redisId = RedisIdEnum.verify(email);

    const cachedToken = await this.cacheManager.get(redisId);

    if (cachedToken !== token)
      throw new GoneException(
        'Token expirado, clique em "Reenviar email de verificação"',
      );

    const [verifiedUser] = await Promise.all([
      this.prisma.user.update({
        where: { email },
        data: { accountVerified: true },
      }),
      this.cacheManager.del(redisId),
    ]);

    return await this.createJwtToken(verifiedUser);
  }

  async forgotPassword(email: string) {
    const user = await this.getUser(email);
    if (!user) throw new NotFoundException('Email não encontrado');

    if (user.signInType !== 'LOCAL') {
      const signInType = getSignInType(user.signInType);
      throw new BadRequestException(
        `Sua conta está vinculada ao ${signInType}. Se esqueceu sua senha a redefina no ${signInType}`,
      );
    }

    const hasToken = await this.tokenExists('reset', user.email);

    if (hasToken)
      throw new BadRequestException(
        `Um email de recuperação de senha já foi enviado para ${user.email}. Caso não o encontre verifique a caixa de spam ou tente recuperar a senha de novo após 20 minutos`,
      );
    await this.emailService.sendResetPasswordEmail(user.name, user.email);
  }

  async validateResetToken(email: string, token: string) {
    const errorMessage = 'Token para redefinição de senha expirado';

    if (!email || !token) throw new BadRequestException(errorMessage);

    email = email.toLowerCase();

    const cachedToken = await this.cacheManager.get(RedisIdEnum.reset(email));
    if (token !== cachedToken) throw new BadRequestException(errorMessage);
  }

  async resetPassword(email: string, token: string, password: string) {
    const errorMessage = 'Token para redefinição de senha expirado';

    const user = await this.getUser(email);
    if (!user) throw new UnauthorizedException(errorMessage);

    const redisId = RedisIdEnum.reset(email);

    const cachedToken = await this.cacheManager.get(redisId);
    if (cachedToken !== token)
      throw new UnauthorizedException(
        'Token para redefinição de senha expirado',
      );

    const { passwordHash, passwordSalt } = await generateHashAndSalt(password);

    const [jwtToken] = await Promise.all([
      this.createJwtToken(user),
      this.prisma.user.update({
        where: { email },
        data: { accountVerified: true, passwordHash, passwordSalt },
      }),
      this.cacheManager.del(redisId),
    ]);

    return jwtToken;
  }

  async updateUser(email: string, updatedUser: UpdateUserDto) {
    if (Object.keys(updatedUser ?? {}).length === 0)
      throw new BadRequestException('Altere os dados antes de salvar');

    const user = await this.getUser(email);

    if (!user) throw new NotFoundException('Conta não encontrada');

    if (user.signInType === 'LOCAL')
      await this.validatePassword(
        updatedUser.currentPassword ?? '',
        user,
        'Senha inválida',
      );
    else if (await this.tokenExists('update', email))
      throw new BadRequestException(
        'A alteração dos dados já foi solicitada, verifique seu email (e caixa de spam)',
      );

    const data: Partial<User> = {};

    updatedUser.name && (data.name = updatedUser.name);
    updatedUser.photo && (data.photo = updatedUser.photo);

    if (user.signInType === 'LOCAL') {
      if (updatedUser.password) {
        const { passwordHash, passwordSalt } = await generateHashAndSalt(
          updatedUser.password,
        );

        data.passwordHash = passwordHash;
        data.passwordSalt = passwordSalt;
      }

      return await this.createJwtToken(
        await this.prisma.user.update({
          where: { email: user.email },
          data,
        }),
      );
    }
    await this.emailService.sendUpdateUserConfirmationEmail(user, data);
  }

  async confirmUpdate(email?: string, requestToken?: string) {
    const user = await this.getUser(email);

    if (!user) throw new NotFoundException('Email não encontrado');

    const redisId = RedisIdEnum.update(email ?? '');
    const content = await this.cacheManager.get(redisId);
    if (!content) throw new BadRequestException('Token expirado');

    const { token, data } = JSON.parse(content as any);

    if (token !== requestToken) throw new BadRequestException('Token expirado');

    Object.entries(data).forEach(([key, value]) => (user[key] = value));

    const [jwt] = await Promise.all([
      this.createJwtToken(user),
      this.prisma.user.update({ where: { email }, data }),
      this.cacheManager.del(redisId),
    ]);

    return jwt;
  }

  private async tokenExists(type: RedisIdTypes, email: string) {
    const id = RedisIdEnum[type](email);
    const token = await this.cacheManager.get(id);
    return !!token;
  }

  private async createJwtToken({ email, name, roles, signInType }: User) {
    const isAdmin = roles.includes('ADMIN');
    const expirationDate = getDateNow().add(
      isAdmin ? { hours: 4 } : { days: 7 },
    );
    const token = await this.jwtService.signAsync(
      {
        sub: email,
        name,
        roles,
        signInType,
        expirationDate: expirationDate.toString(),
      },
      {
        expiresIn: isAdmin ? '4h' : '31d',
      },
    );
    return { token };
  }

  private getUser(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  private async validatePassword(
    password: string,
    { passwordHash, passwordSalt }: User,
    message = 'Email ou senha inválidos',
  ) {
    const isPasswordCorrect = await checkPassword(
      password,
      passwordHash,
      passwordSalt,
    );

    if (!isPasswordCorrect) throw new UnauthorizedException(message);
  }
}
