import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { GoogleUser } from '../types/google-user';
import { GOOGLE } from './google.constants';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: GOOGLE.clientId,
      clientSecret: GOOGLE.clientSecret,
      callbackURL: 'https://migo-to-nihongo.herokuapp.com/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const user: GoogleUser = {
      email: profile.emails[0].value,
      verified: profile.emails[0].verified,
      name: profile.name.givenName,
      photo: profile.photos?.[0]?.value,
    };

    done(null, user);
  }
}
