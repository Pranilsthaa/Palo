import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';

@Injectable()
export class refreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('x-refresh-token'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { userId: number; name: string }) {
    const header = req.get('x-refresh-token');
    if (!header) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const refreshToken = header.replace('Bearer', '').trim();

    const user = await this.userService.findUserById(payload.userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!isRefreshTokenMatching) throw new UnauthorizedException();

    return {
      ...payload,
      refreshToken,
    };
  }
}
