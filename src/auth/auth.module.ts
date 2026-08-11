import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserService } from "src/user/user.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleStrategy } from "./strategies/google.strategy";
import { jwtStrategy } from "./strategies/jwt.strategy";
import { refreshTokenStrategy } from "./strategies/refresh-token.strategy";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: "15m" },
    }),
  ],
  providers: [
    AuthService,
    jwtStrategy,
    refreshTokenStrategy,
    UserService,
    GoogleStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
