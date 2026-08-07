import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";

@Injectable()
export class GoogleStrategy {
  private client: OAuth2Client;

  constructor(private config: ConfigService) {
    this.client = new OAuth2Client(this.config.get("GOOGLE_WEB_CLIENT_ID"));
  }

  async verifyToken(idToken: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.config.get("GOOGLE_WEB_CLIENT_ID"),
      });

      const payload = ticket.getPayload();

      return {
        googleId: payload?.sub,
        email: payload?.email,
        name: payload?.name,
        picture: payload?.picture,
        emailVerified: payload?.email_verified,
      };
    } catch {
      throw new UnauthorizedException("Invalid Google token");
    }
  }
}
