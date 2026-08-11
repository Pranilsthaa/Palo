import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserService } from "src/user/user.service";
import { login, registerUser } from "./auth.controller";
import { GoogleStrategy } from "./strategies/google.strategy";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
    private googleStrategy: GoogleStrategy,
  ) {}

  async generateToken(userId: number, name: string) {
    const payload = {
      userId,
      name,
    };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: "15m",
    });
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: "7d",
    });
    return { access_token, refresh_token };
  }

  async getTokensAndSaveRefreshToken(userId: number, name: string) {
    const { access_token, refresh_token } = await this.generateToken(
      userId,
      name,
    );

    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refresh_token, salt);

    await this.userService.updateRefreshToken(hashedRefreshToken, userId);

    return { access_token, refresh_token };
  }

  async registerUser(data: registerUser) {
    const { email, password, name, contact } = data;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userService.createUser({
      email,
      password: hashedPassword,
      name,
      contact,
    });
    return this.getTokensAndSaveRefreshToken(user.id, name);
  }

  async login(data: login) {
    const { email, password } = data;

    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new UnauthorizedException("Invalid username or password");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException("Invalid username or password");
    const { refresh_token, access_token } =
      await this.getTokensAndSaveRefreshToken(user.id, user.name);
    return {
      user: {
        email: user.email,
        contact: user.contact,
        name: user.name,
        createdAt: user.createdAt,
      },
      tokens: {
        refresh_token,
        access_token,
      },
    };
  }

  async googleLogin(idToken: string) {
    const googleUser = await this.googleStrategy.verifyToken(idToken);
    const user = await this.userService.findOrCreateGoogleUser(googleUser);
    const { refresh_token, access_token } =
      await this.getTokensAndSaveRefreshToken(user.id, user.name);

    return { user, tokens: { refresh_token, access_token } };
  }

  async logout(userId: number) {
    // await this.userService.updateRefreshToken(null, userId);
    // return {
    //   message: "Logged out successfully",
    // };
    console.log("first");
    return "test";
  }
}
