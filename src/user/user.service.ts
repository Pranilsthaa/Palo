import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { registerUser } from "src/auth/auth.controller";
import { DRIZZLE } from "src/db/db.module";
import * as schema from "../db/schema";

@Injectable()
export class UserService {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async createUser(user: registerUser) {
    try {
      const result = await this.db
        .insert(schema.users)
        .values(user)
        .returning({ id: schema.users.id });

      return result[0];
    } catch (e: any) {
      if (e?.cause?.code === "23505") {
        throw new ConflictException("User with this email already exists");
      }
      throw new InternalServerErrorException("Error creating user");
    }
  }

  async findUserById(userId: number) {
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    return user[0];
  }

  async findUserByEmail(email: string) {
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    return user[0];
  }

  async updateRefreshToken(hash: string | null, userId: number) {
    return this.db
      .update(schema.users)
      .set({ refreshToken: hash })
      .where(eq(schema.users.id, userId));
  }

  async findOrCreateGoogleUser(googleUser: { email: string; name: string }) {
    // check if email exists (manual signup)
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, googleUser.email));
    if (user) {
      return user[0];
    }

    // create new
    return this.db.insert(schema.users).values({
      email: googleUser.email,
      name: googleUser.name,
      contact: "",
      password: "",
    });
  }
}
