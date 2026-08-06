import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class jwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {}
