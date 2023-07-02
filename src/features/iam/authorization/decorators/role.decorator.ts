import { SetMetadata } from '@nestjs/common';

import { ROLES_KEY } from '@api/features/iam/iam.constants';

export const Role = (...roles: Array<string>) => SetMetadata(ROLES_KEY, roles);
