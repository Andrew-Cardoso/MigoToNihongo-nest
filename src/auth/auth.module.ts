import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from './strategy/jwt.constants';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PrismaModule } from 'src/utils/modules/prisma/prisma.module';
import { GoogleStrategy } from './strategy/google.strategy';
import { EmailModule } from 'src/utils/modules/email/email.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    JwtModule.register({
      secret: JWT.secret,
    }),
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
