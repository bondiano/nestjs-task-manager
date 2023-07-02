import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { JWTEnvironmentVariables, jwtConfig, validate } from '@api/configs';

import { AccessTokenGuard } from './access-token.guard';
import { AuthenticationGuard } from './authentication/authentication.guard';
import { RolesGuard } from './authorization/guards/role.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validate(JWTEnvironmentVariables),
      load: [jwtConfig],
    }),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthGuarsModule {}
