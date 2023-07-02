import { FastifyRequest } from 'fastify';

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { InjectJWTConfig, JWTConfiguration } from '@api/configs';

import { InvalidAccessToken } from './errors/invalid-access-token.error';
import { AUTHENTICATION_COOKIE_NAME, REQUEST_USER_KEY } from './iam.constants';
import { IActiveUserData } from './interfaces/active-user.interface';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    @InjectJWTConfig()
    private readonly jwtConfiguration: JWTConfiguration,
    private readonly jwtService: JwtService
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & Record<string, unknown>>();
    const token = this.extractTokenFromRequest(request);
    if (!token) {
      throw new InvalidAccessToken();
    }

    try {
      const payload = await this.jwtService.verifyAsync<IActiveUserData>(
        token,
        {
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
          secret: this.jwtConfiguration.secret,
        }
      );

      request[REQUEST_USER_KEY] = payload;
    } catch {
      throw new InvalidAccessToken();
    }

    return true;
  }

  private extractTokenFromRequest(request: FastifyRequest): string | undefined {
    return request.cookies?.[AUTHENTICATION_COOKIE_NAME];
  }
}
