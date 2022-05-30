import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { User, UserGoogle } from './decorators/get-user.decorator';
import { EmailDto } from './dtos/email.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserSignInDto } from './dtos/user-sign-in.dto';
import { UserSignUpDto } from './dtos/user-sign-up.dto';
import { EmailTokenDto } from './dtos/email-token.dto';
import { CurrentUser } from './types/current-user';
import { GoogleUser } from './types/google-user';

const getErrorUrl = (error: any) => {
  const message = error.response.message;
  return `${process.env.FRONTEND_URL}/auth?error=${message}`;
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //**   User Login   */
  @Post('/sign-in')
  @HttpCode(HttpStatus.CREATED)
  async signInLocal(@Body() { email, password }: UserSignInDto) {
    return await this.authService.signInLocal(email, password);
  }

  @Post('/sign-up')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signUpLocal(@Body() userDto: UserSignUpDto) {
    return await this.authService.signUpLocal(userDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/user-photo')
  async getUserPhoto(@User() { email }: CurrentUser) {
    return this.authService.getUserImage(email);
  }

  //**   User Email Verify  */
  @Get('/verify-email')
  async verifyEmail(
    @Query() { email, token }: EmailTokenDto,
    @Res() res: Response,
  ) {
    try {
      const jwt = await this.authService.verifyEmail(email, token);
      res.redirect(`${process.env.FRONTEND_URL}?token=${jwt.token}`);
    } catch (error) {
      res.redirect(getErrorUrl(error));
    }
  }

  //**    User Password Handler    */

  @Post('/forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(@Body() { email }: EmailDto) {
    return await this.authService.forgotPassword(email);
  }

  @Get('/validate-reset-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async validateResetToken(@Query() { email, token }: EmailTokenDto) {
    return await this.authService.validateResetToken(email, token);
  }

  @Post('/reset-password')
  @HttpCode(HttpStatus.CREATED)
  async resetPassword(@Body() { email, token, password }: ResetPasswordDto) {
    return await this.authService.resetPassword(email, token, password);
  }

  //**   User Update */
  @UseGuards(AuthGuard('jwt'))
  @Put('/update-user')
  async updateUser(
    @Body() updatedUser: UpdateUserDto,
    @User() { email }: CurrentUser,
    @Res() res: Response,
  ) {
    const jwt = await this.authService.updateUser(email, updatedUser);
    return jwt
      ? res.status(HttpStatus.CREATED).json(jwt)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @Get('/confirm-update')
  async confirmUpdate(
    @Query() { email, token }: EmailTokenDto,
    @Res() res: Response,
  ) {
    try {
      const jwt = await this.authService.confirmUpdate(email, token);
      res.redirect(`${process.env.FRONTEND_URL}?token=${jwt.token}`);
    } catch (error) {
      res.redirect(getErrorUrl(error));
    }
  }

  //**   THIRD PARTY LOGIN   */

  @Get('/google/sign-in')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @UserGoogle() googleUser: GoogleUser,
    @Res() res: Response,
  ) {
    try {
      const jwt = await this.authService.signInGoogle(googleUser);
      res.redirect(`${process.env.FRONTEND_URL}?token=${jwt.token}`);
    } catch (error) {
      res.redirect(getErrorUrl(error));
    }
  }
}
