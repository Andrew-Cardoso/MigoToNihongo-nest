import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CurrentUser } from '../types/current-user';
import { JWT } from './jwt.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT.secret,
    });
  }

  async validate(payload: any) {
    const currentUser: CurrentUser = {
      email: payload.sub,
      name: payload.name,
      roles: payload.roles,
    };
    return currentUser;
  }
}
