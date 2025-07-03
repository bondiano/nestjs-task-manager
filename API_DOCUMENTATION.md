# NestJS IAM Framework - API Documentation

## Overview

This is a comprehensive NestJS Identity and Access Management (IAM) framework that provides authentication, authorization, and user management capabilities. The framework is built with TypeScript, uses PostgreSQL for data persistence, Redis for token storage, and includes health monitoring capabilities.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Public APIs](#public-apis)
3. [Core Components](#core-components)
4. [Authentication & Authorization](#authentication--authorization)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Utilities & Libraries](#utilities--libraries)
8. [Configuration](#configuration)
9. [Usage Examples](#usage-examples)

## Architecture Overview

The application follows a modular architecture with clear separation of concerns:

```
src/
├── app/                 # Main application module
├── core/               # Core functionality (interceptors, filters, pipes)
├── features/           # Feature modules (IAM)
├── lib/                # Shared libraries and utilities
└── configs/            # Configuration modules
```

## Public APIs

### Health Check API

#### GET /api/health

**Description**: Returns the health status of the application and its dependencies.

**Response**: 
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    }
  }
}
```

**Controller**: `HealthController`
**Tags**: Health Check

### Container Information API

#### GET /api/container

**Description**: Returns information about the container environment.

**Response**:
```json
{
  "ip": "127.0.0.1",
  "hostname": "container-hostname"
}
```

**Controller**: `AppController`

## Core Components

### 1. Base Entity

**File**: `src/lib/base-entity/base-entity.ts`

All entities extend from this base class, providing common fields:

```typescript
export class BaseEntity extends TypeOrmBaseEntity {
  readonly id: number;              // Primary key
  readonly createdAt: Date;         // Creation timestamp
  readonly updatedAt: Date;         // Last update timestamp
  readonly deletedAt: Date | null;  // Soft delete timestamp
}
```

**Usage**:
```typescript
import { BaseEntity } from '@api/lib/base-entity';

@Entity()
export class User extends BaseEntity {
  @Column()
  name: string;
}
```

### 2. Base Response

**File**: `src/lib/base-response/base-response.ts`

Standardized response wrapper for API endpoints:

```typescript
export class BaseResponse<T> {
  static async fromTaskEither<E, C extends BaseResponse<E>>(
    this: C, 
    data: TaskEither<Error, E>
  ): Promise<InstanceType<C>>

  static async fromPartialTaskEither<D extends object, R extends PartialTaskEither<D>>(
    this: C,
    data: R
  ): Promise<InstanceType<C>>
}
```

**Usage**:
```typescript
class UserResponse extends BaseResponse<User> {}

// Using with TaskEither
const userTE: TaskEither<Error, User> = getUser(id);
const response = await UserResponse.fromTaskEither(userTE);
```

### 3. Crypto Service

**File**: `src/lib/crypto/crypto.service.ts`

Provides cryptographic operations for password hashing and verification:

```typescript
@Injectable()
export class CryptoService {
  hash(plain: string): Promise<string>
  verify(hash: string, plain: string): Promise<boolean>
  generateRandomString(length: number): string
}
```

**Usage**:
```typescript
constructor(private cryptoService: CryptoService) {}

// Hash a password
const hashedPassword = await this.cryptoService.hash('mypassword');

// Verify a password
const isValid = await this.cryptoService.verify(hashedPassword, 'mypassword');

// Generate random string
const token = this.cryptoService.generateRandomString(32);
```

## Authentication & Authorization

### Authentication Service

**File**: `src/features/iam/authentication/authentication.service.ts`

Core authentication service providing user management and token operations:

```typescript
@Injectable()
export class AuthenticationService<T extends AuthEntity> {
  signUp(signUpDto: SignUpDto, user: T): TaskEither<Error, IUserIdData<T>>
  signIn(signInDto: SignInDto): TaskEither<Error, IUserIdData<T>>
  signOut(signOutDto: SignOutDto): TaskEither<Error, void>
  refreshToken(refreshTokenDto: RefreshTokenDto): TaskEither<Error, ITokensData>
  resetPassword(email: string, password: string): TaskEither<Error, void>
}
```

### DTOs (Data Transfer Objects)

#### Sign Up DTO
```typescript
export class SignUpDto {
  @ApiProperty()
  @IsEmail()
  @EmailTransformer()
  email: string;

  @ApiProperty()
  @MinLength(8)
  password: string;
}
```

#### Sign In DTO
```typescript
export class SignInDto {
  @ApiProperty()
  @IsEmail()
  @EmailTransformer()
  email: string;

  @ApiProperty()
  @MinLength(8)
  password: string;
}
```

#### Refresh Token DTO
```typescript
export class RefreshTokenDto {
  @ApiProperty()
  refreshToken: string;
}
```

#### Sign Out DTO
```typescript
export class SignOutDto {
  @ApiProperty()
  userId: number;
}
```

### Guards and Decorators

#### Access Token Guard
**File**: `src/features/iam/access-token.guard.ts`

Protects routes requiring authentication:

```typescript
@Injectable()
export class AccessTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean>
}
```

**Usage**:
```typescript
@Controller('protected')
@UseGuards(AccessTokenGuard)
export class ProtectedController {
  @Get()
  getProtectedData() {
    return { message: 'This is protected data' };
  }
}
```

#### Role Guard
**File**: `src/features/iam/authorization/guards/role.guard.ts`

Provides role-based access control:

```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean
}
```

#### Active User Decorator
**File**: `src/features/iam/active-user.decorator.ts`

Extracts the current authenticated user from the request:

```typescript
export const ActiveUser = createParamDecorator(
  (field: keyof IActiveUserData | undefined, ctx: ExecutionContext) => {
    // Implementation
  }
);
```

**Usage**:
```typescript
@Get('profile')
getProfile(@ActiveUser() user: IActiveUserData) {
  return user;
}

@Get('email')
getEmail(@ActiveUser('email') email: string) {
  return { email };
}
```

#### Role Decorator
**File**: `src/features/iam/authorization/decorators/role.decorator.ts`

Specifies required roles for accessing endpoints:

```typescript
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

**Usage**:
```typescript
@Get('admin')
@Roles('admin')
@UseGuards(AccessTokenGuard, RoleGuard)
getAdminData() {
  return { message: 'Admin only data' };
}
```

## Data Models

### Auth Entity

**File**: `src/features/iam/auth.entity.ts`

Base authentication entity:

```typescript
export class AuthEntity extends BaseEntity {
  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;
}
```

**Usage**:
```typescript
// Extend AuthEntity for your user model
@Entity('users')
export class User extends AuthEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;
}
```

## Error Handling

### Domain Exception Filter

**File**: `src/core/filters/domain-exceptions.filter.ts`

Global exception filter for handling domain-specific errors.

### Custom Errors

The framework includes several custom error types:
- `CouldNotCreateUser`
- `CouldNotFindUser`
- `CouldNotGenerateToken`
- `InvalidCredentials`
- `UserAlreadyExists`
- `CouldNotUpdatePassword`

## Utilities & Libraries

### Decorators

#### Email Transformer
**File**: `src/lib/decorators/email-transformer.decorator.ts`

Transforms email input to lowercase:

```typescript
@EmailTransformer()
email: string;
```

#### Is Relation ID
**File**: `src/lib/decorators/is-relation-id.decorator.ts`

Validates that a value is a valid relation ID:

```typescript
@IsRelationId()
userId: number;
```

### Interceptors

#### Either Interceptor
**File**: `src/core/interceptors/either.interceptor.ts`

Handles functional programming Either/TaskEither responses.

#### Unify Response Interceptor
**File**: `src/core/interceptors/unify-response.interceptor.ts`

Standardizes all API responses with consistent structure.

#### Error Interceptor
**File**: `src/core/interceptors/error.interceptor.ts`

Global error handling and logging.

### Pipes

#### Advanced Validation Pipe
**File**: `src/core/pipes/advanced-validation.pipe.ts`

Enhanced validation with custom error formatting.

## Configuration

The application uses environment-based configuration with validation:

### Environment Variables

- `APP_PORT`: Application port (default: 3000)
- `APP_HOST`: Application host (default: localhost)
- `DATABASE_*`: Database connection settings
- `REDIS_*`: Redis connection settings
- `JWT_*`: JWT configuration settings

### JWT Configuration
```typescript
interface JWTConfiguration {
  secret: string;
  audience: string;
  issuer: string;
  accessTokenTtl: number;
  refreshTokenTtl: number;
}
```

## Usage Examples

### Setting up the IAM Module

```typescript
// In your feature module
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

### Creating a Protected Controller

```typescript
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AccessTokenGuard, ActiveUser, Roles, RoleGuard } from '@api/features/iam';

@Controller('api/users')
@UseGuards(AccessTokenGuard)
export class UserController {
  @Get('profile')
  getProfile(@ActiveUser() user: IActiveUserData) {
    return { 
      id: user.sub,
      email: user.email,
      role: user.role 
    };
  }

  @Get('admin')
  @Roles('admin')
  @UseGuards(RoleGuard)
  getAdminData() {
    return { message: 'This is admin-only data' };
  }
}
```

### Using the Authentication Service

```typescript
import { AuthenticationService } from '@api/features/iam';
import { TaskEither } from 'fp-ts/TaskEither';

@Injectable()
export class UserService {
  constructor(
    private authService: AuthenticationService<User>
  ) {}

  async registerUser(signUpDto: SignUpDto): Promise<any> {
    const user = new User();
    const result: TaskEither<Error, any> = this.authService.signUp(signUpDto, user);
    
    return result();
  }
}
```

### Error Handling with TaskEither

```typescript
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

// Example of using TaskEither for error handling
const createUserFlow = pipe(
  this.authService.signUp(signUpDto, user),
  TE.map(({ user, tokens }) => ({
    message: 'User created successfully',
    user: {
      id: user.id,
      email: user.email
    },
    tokens
  })),
  TE.mapLeft((error) => ({
    message: 'Failed to create user',
    error: error.message
  }))
);

// Execute the flow
const result = await createUserFlow();
```

## API Response Format

All API responses follow a consistent format through the `UnifyHttpResponse` interceptor:

### Success Response
```json
{
  "data": {
    // Actual response data
  },
  "message": "Success message",
  "statusCode": 200
}
```

### Error Response
```json
{
  "error": {
    "message": "Error message",
    "details": "Additional error details"
  },
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

## Development Setup

1. **Install Dependencies**:
   ```bash
   yarn install
   ```

2. **Environment Configuration**:
   Create `.env` file with required environment variables.

3. **Database Setup**:
   Configure PostgreSQL connection and run migrations.

4. **Redis Setup**:
   Configure Redis for token storage.

5. **Start Development Server**:
   ```bash
   yarn dev
   ```

## Testing

The framework includes comprehensive testing setup:

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:cov

# Run e2e tests
yarn test:e2e
```

## Building for Production

```bash
# Build the application
yarn build

# Start production server
yarn start:prod
```

This documentation covers all the public APIs, components, and utilities provided by the NestJS IAM framework. The framework is designed to be extensible and can be easily integrated into larger applications requiring authentication and authorization capabilities.