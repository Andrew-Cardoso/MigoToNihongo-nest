import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserGoogle } from './decorators/get-user.decorator';
import { UserSignInDto } from './dtos/user-sign-in.dto';
import { UserSignUpDto } from './dtos/user-sign-up.dto';
import { GoogleUser } from './types/google-user';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @Get('/verify-user')
  // async verifyUser(@Query() { email, token }: VerificationDto) {
  //   return await this.authService.verifyUser(email, token);
  // }

  // @Get()
  // async teste() {
  //   console.log('teste');
  //   return await this.authService.teste();
  // }

  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  async signInLocal(@Body() { email, password }: UserSignInDto) {
    return await this.authService.signInLocal(email, password);
  }

  @Post('/sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUpLocal(@Body() userDto: UserSignUpDto) {
    return await this.authService.signUpLocal(userDto);
  }

  @Get('/google/sign-in')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @UserGoogle() googleUser: GoogleUser,
    @Res() res: any,
  ) {
    const jwt = await this.authService.signInGoogle(googleUser);
    return res.redirect(`http://localhost:3333?token=${jwt.token}`);
  }

  // @Post('/send-verification-email')
  // async sendVerificationEmail(@Body() { email, password }: UserSignInDto) {
  //   return await this.authService.checkUserAndSendVerificationEmail(
  //     email,
  //     password,
  //   );
  // }
}
