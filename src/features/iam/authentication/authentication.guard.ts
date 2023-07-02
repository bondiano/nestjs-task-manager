import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AccessTokenGuard } from '../access-token.guard';
import { AuthType } from '../enums/auth-type.enum';
import { InvalidCredentials } from '../errors';
import { AUTH_TYPE_KEY } from '../iam.constants';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.None;
  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | Array<CanActivate>
  > = {
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.None]: { canActivate: () => true },
  };

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<Array<AuthType>>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()]
    ) ?? [AuthenticationGuard.defaultAuthType];
    const guards = authTypes.flatMap((type) => this.authTypeGuardMap[type]);
    let error = new InvalidCredentials();

    for (const guard of guards) {
      const canActivate = await Promise.resolve(
        guard.canActivate(context)
      ).catch((error_) => {
        error = error_;
      });

      if (canActivate) {
        return true;
      }
    }

    throw error;
  }
}
