# Quick Reference Guide

## Overview

This quick reference provides condensed information for developers working with the NestJS IAM framework. It includes the most commonly used patterns, APIs, and code snippets for rapid development.

## Quick Setup

### 1. Module Setup
```typescript
// user.module.ts
import { IamModule } from '@api/features/iam';
import { User } from './user.entity';

@Module({
  imports: [
    IamModule.forRoot<User>({
      entity: User,
      key: 'user'
    })
  ]
})
export class UserModule {}
```

### 2. User Entity
```typescript
// user.entity.ts
import { Entity, Column } from 'typeorm';
import { AuthEntity } from '@api/features/iam';

@Entity('users')
export class User extends AuthEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;
}
```

## Common Patterns

### Protected Controller
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccessTokenGuard, ActiveUser, Roles, RoleGuard } from '@api/features/iam';

@Controller('api/users')
@UseGuards(AccessTokenGuard)
export class UserController {
  @Get('profile')
  getProfile(@ActiveUser() user: IActiveUserData) {
    return user;
  }

  @Get('admin')
  @Roles('admin')
  @UseGuards(RoleGuard)
  getAdminData() {
    return { message: 'Admin only' };
  }
}
```

### Authentication Flow
```typescript
import { AuthenticationService } from '@api/features/iam';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

@Injectable()
export class AuthController {
  constructor(private authService: AuthenticationService<User>) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = new User();
    const result = await pipe(
      this.authService.signUp(signUpDto, user),
      TE.map(({ user, tokens }) => ({ 
        message: 'User created',
        user: { id: user.id, email: user.email },
        tokens 
      }))
    )();
    
    return result;
  }

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    const result = await this.authService.signIn(signInDto)();
    return result;
  }
}
```

## API Endpoints

### Health Check
```
GET /api/health
Returns: { status: "ok", info: {...}, details: {...} }
```

### Container Info
```
GET /api/container
Returns: { ip: "127.0.0.1", hostname: "hostname" }
```

## DTOs

### Authentication DTOs
```typescript
// Sign Up / Sign In
{
  email: "user@example.com",    // Required, valid email
  password: "password123"       // Required, min 8 chars
}

// Refresh Token
{
  refreshToken: "jwt.token.here"
}

// Sign Out
{
  userId: 123
}
```

## Decorators Quick Reference

| Decorator | Usage | Purpose |
|-----------|--------|---------|
| `@ActiveUser()` | `@ActiveUser() user` | Get current user |
| `@ActiveUser('email')` | `@ActiveUser('email') email` | Get user email |
| `@Roles('admin')` | `@Roles('admin', 'user')` | Require roles |
| `@UseGuards(AccessTokenGuard)` | On controller/method | Require auth |
| `@UseGuards(RoleGuard)` | With `@Roles()` | Check roles |
| `@EmailTransformer()` | On DTO property | Lowercase email |
| `@IsRelationId()` | On DTO property | Validate ID |

## Guards

```typescript
// Authentication required
@UseGuards(AccessTokenGuard)

// Role-based access
@Roles('admin', 'moderator')
@UseGuards(AccessTokenGuard, RoleGuard)

// Custom authentication type
@Authentication(AuthenticationType.Bearer)
@UseGuards(AuthenticationGuard)
```

## Services Quick Reference

### CryptoService
```typescript
constructor(private crypto: CryptoService) {}

// Hash password
const hash = await this.crypto.hash('password');

// Verify password
const isValid = await this.crypto.verify(hash, 'password');

// Generate random string
const token = this.crypto.generateRandomString(32);
```

### AuthenticationService
```typescript
constructor(private auth: AuthenticationService<User>) {}

// Methods return TaskEither<Error, Result>
this.auth.signUp(signUpDto, user)
this.auth.signIn(signInDto)
this.auth.signOut(signOutDto)
this.auth.refreshToken(refreshTokenDto)
this.auth.resetPassword(email, newPassword)
```

## Error Handling

### Custom Errors
```typescript
import { 
  CouldNotCreateUser,
  CouldNotFindUser,
  InvalidCredentials,
  UserAlreadyExists 
} from '@api/features/iam/errors';
```

### TaskEither Error Handling
```typescript
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

const result = await pipe(
  this.authService.signIn(signInDto),
  TE.map(data => ({ success: true, data })),
  TE.mapLeft(error => ({ success: false, error: error.message }))
)();
```

## Response Patterns

### Standard Response Format
```json
{
  "data": { /* actual data */ },
  "message": "Success message",
  "statusCode": 200
}
```

### Error Response Format
```json
{
  "error": {
    "message": "Error message",
    "details": "Additional details"
  },
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

### Using BaseResponse
```typescript
import { BaseResponse } from '@api/lib/base-response';

class UserResponse extends BaseResponse<User> {}

// From TaskEither
const response = await UserResponse.fromTaskEither(userTE);

// From partial TaskEither
const response = await BaseResponse.fromPartialTaskEither({
  user: userTE,
  profile: profileTE
});
```

## Environment Variables

### Required Variables
```env
# Application
APP_PORT=3000
APP_HOST=localhost

# Database (PostgreSQL)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
DATABASE_NAME=myapp

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_AUDIENCE=myapp
JWT_ISSUER=myapp
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=86400

# Crypto
CRYPTO_MEMORY_COST=4096
CRYPTO_TIME_COST=3
CRYPTO_PARALLELISM=1
```

## Common Validation Patterns

### DTO Validation
```typescript
import { IsEmail, MinLength, IsString, IsOptional } from 'class-validator';
import { EmailTransformer, IsRelationId } from '@api/lib/decorators';

export class CreateUserDto {
  @IsEmail()
  @EmailTransformer()
  email: string;

  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsRelationId()
  @IsOptional()
  departmentId?: number;
}
```

### Entity Patterns
```typescript
import { Entity, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '@api/lib/base-entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  @Exclude({ toPlainOnly: true })  // Hide from responses
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  firstName: string;

  @OneToMany(() => Task, task => task.user)
  tasks: Task[];
}
```

## Testing Patterns

### Service Testing
```typescript
import { Test } from '@nestjs/testing';
import { AuthenticationService } from '@api/features/iam';

describe('AuthenticationService', () => {
  let service: AuthenticationService<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        // Mock providers
      ],
    }).compile();

    service = module.get<AuthenticationService<User>>(AuthenticationService);
  });

  it('should sign up user', async () => {
    const result = await service.signUp(signUpDto, user)();
    expect(result).toBeDefined();
  });
});
```

### Controller Testing
```typescript
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });
});
```

## Development Scripts

```bash
# Development
yarn dev              # Start in watch mode
yarn dev:debug        # Start with debugger
yarn dev:repl         # Start REPL

# Testing
yarn test             # Run tests
yarn test:watch       # Watch mode
yarn test:cov         # With coverage
yarn test:e2e         # End-to-end tests

# Production
yarn build            # Build application
yarn start:prod       # Start production

# Linting
yarn lint             # Check code style
```

## Docker Setup

### Dockerfile Example
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_HOST=db
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

  redis:
    image: redis:7-alpine
```

## Troubleshooting

### Common Issues

1. **JWT Token Invalid**
   - Check JWT_SECRET configuration
   - Verify token expiration times
   - Ensure audience/issuer match

2. **Database Connection**
   - Verify DATABASE_* environment variables
   - Check PostgreSQL is running
   - Validate connection parameters

3. **Redis Connection**
   - Check REDIS_* environment variables
   - Ensure Redis is accessible
   - Verify network connectivity

4. **Validation Errors**
   - Check DTO decorators
   - Verify request payload format
   - Review validation pipe configuration

### Debug Tips

```typescript
// Enable debug logging
import { Logger } from '@nestjs/common';
const logger = new Logger('MyComponent');
logger.debug('Debug message');

// Check request user data
@Get('debug')
debugUser(@ActiveUser() user: IActiveUserData) {
  console.log('User data:', user);
  return user;
}
```

This quick reference provides the essential information needed for day-to-day development with the NestJS IAM framework.