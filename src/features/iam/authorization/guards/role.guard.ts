import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY, REQUEST_USER_KEY } from '../../iam.constants';
import { IActiveUserData } from '../../interfaces/active-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const contextRoles = this.reflector.getAllAndOverride<Array<string>>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!contextRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user: IActiveUserData = request[REQUEST_USER_KEY];

    return contextRoles.includes(user.role);
  }
}
