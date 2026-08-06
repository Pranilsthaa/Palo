import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './db/db.module';
import { APP_GUARD } from '@nestjs/core';
import { jwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, DatabaseModule, UserModule],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: jwtAuthGuard }, AppService],
})
export class AppModule {}
