# Component Reference Guide

## Overview

This document provides detailed technical documentation for each component, service, and utility in the NestJS IAM framework. It serves as a comprehensive reference for developers working with or extending the framework.

## Table of Contents

1. [Controllers](#controllers)
2. [Services](#services)
3. [Guards](#guards)
4. [Interceptors](#interceptors)
5. [Decorators](#decorators)
6. [DTOs](#dtos)
7. [Entities](#entities)
8. [Filters](#filters)
9. [Pipes](#pipes)
10. [Utilities](#utilities)
11. [Interfaces](#interfaces)
12. [Error Classes](#error-classes)

## Controllers

### AppController

**File**: `src/app/app.controller.ts`
**Path**: `/api`

```typescript
@Controller()
export class AppController {
  @Get('container')
  getContainer(@Req() request: FastifyRequest): object
}
```

**Methods**:
- `getContainer()`: Returns container information including IP address and hostname

### HealthController

**File**: `src/core/health/health.controller.ts`
**Path**: `/api/health`
**Tags**: Health Check

```typescript
@Controller('health')
@ApiTags('Health Check')
export class HealthController {
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult>
}
```

**Dependencies**:
- `HealthCheckService`
- `TypeOrmHealthIndicator`
- `MemoryHealthIndicator`

**Methods**:
- `check()`: Performs health checks on database and memory usage

## Services

### AuthenticationService

**File**: `src/features/iam/authentication/authentication.service.ts`
**Generic**: `<T extends AuthEntity>`

```typescript
@Injectable()
export class AuthenticationService<T extends AuthEntity> implements IAuthenticationService<T> {
  constructor(
    @Inject(AUTH_REPOSITORY_KEY) private readonly userRepository: Repository<T>,
    @Inject(IAM_MODULE_OPTIONS_KEY) private readonly iamModuleOptions: IIamModuleOptions<T>,
    @InjectJWTConfig() private readonly jwtConfiguration: JWTConfiguration,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage<T>
  ) {}
}
```

**Public Methods**:
- `signUp(signUpDto: SignUpDto, user: T): TaskEither<Error, IUserIdData<T>>`
- `signIn(signInDto: SignInDto): TaskEither<Error, IUserIdData<T>>`
- `signOut(signOutDto: SignOutDto): TaskEither<Error, void>`
- `refreshToken(refreshTokenDto: RefreshTokenDto): TaskEither<Error, ITokensData>`
- `validatePassword(hashedPassword: string, providedPassword: string): TaskEither<Error, boolean>`
- `createPassword(password: string): TaskEither<Error, string>`
- `generateResetPasswordToken(): TaskEither<Error, string>`
- `resetPassword(email: string, password: string): TaskEither<Error, void>`
- `findUserByEmail(email: T['email']): TaskEither<Error, T>`

**Private Methods**:
- `saveUser(user: T): TaskEither<Error, T>`
- `findUserById(id: T['id']): TaskEither<Error, T>`
- `signToken<P>(sub: T['id'], expiresIn: number, payload?: P): Promise<string>`
- `generateTokens(user: T): TaskEither<Error, ITokens>`
- `verifyToken<P>(token: string): TaskEither<Error, Pick<IActiveUserData, 'sub'> & P>`

### CryptoService

**File**: `src/lib/crypto/crypto.service.ts`

```typescript
@Injectable()
export class CryptoService {
  constructor(
    @InjectCryptoConfig() private readonly cryptoConfiguration: CryptoConfiguration
  ) {}
}
```

**Methods**:
- `hash(plain: string): Promise<string>` - Hashes a plain text string using Argon2
- `verify(hash: string, plain: string): Promise<boolean>` - Verifies a plain text against its hash
- `generateRandomString(length: number): string` - Generates a cryptographically secure random string

### RefreshTokenIdsStorage

**File**: `src/features/iam/refresh-token-ids.storage.ts`
**Generic**: `<T extends AuthEntity>`

```typescript
@Injectable()
export class RefreshTokenIdsStorage<T extends AuthEntity> {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}
}
```

**Methods**:
- `insert(userId: T['id'], tokenId: string): Promise<void>` - Stores a refresh token ID
- `validate(userId: T['id'], tokenId: string): Promise<boolean>` - Validates a refresh token ID
- `invalidate(userId: T['id']): Promise<void>` - Removes all refresh tokens for a user

## Guards

### AccessTokenGuard

**File**: `src/features/iam/access-token.guard.ts`

```typescript
@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectJWTConfig() private readonly jwtConfiguration: JWTConfiguration,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean>
}
```

**Purpose**: Validates JWT access tokens and extracts user information

### AuthenticationGuard

**File**: `src/features/iam/authentication/authentication.guard.ts`

```typescript
@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean>
}
```

**Purpose**: Determines if authentication is required for an endpoint

### RoleGuard

**File**: `src/features/iam/authorization/guards/role.guard.ts`

```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean
}
```

**Purpose**: Validates user roles against required roles for an endpoint

## Interceptors

### ApplyTokensInterceptor

**File**: `src/features/iam/apply-tokens.interceptor.ts`

```typescript
@Injectable()
export class ApplyTokensInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any>
}
```

**Purpose**: Applies authentication tokens to responses

### EitherInterceptor

**File**: `src/core/interceptors/either.interceptor.ts`

```typescript
@Injectable()
export class EitherInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any>
}
```

**Purpose**: Handles fp-ts Either and TaskEither types in responses

### ErrorInterceptor

**File**: `src/core/interceptors/error.interceptor.ts`

```typescript
@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any>
}
```

**Purpose**: Global error logging and handling

### UnifyHttpResponse

**File**: `src/core/interceptors/unify-response.interceptor.ts`

```typescript
@Injectable()
export class UnifyHttpResponse implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<any>>
}
```

**Purpose**: Standardizes all HTTP responses with consistent structure

## Decorators

### ActiveUser

**File**: `src/features/iam/active-user.decorator.ts`

```typescript
export const ActiveUser = createParamDecorator(
  (field: keyof IActiveUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: IActiveUserData = request[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  }
);
```

**Purpose**: Extracts authenticated user data from request

### Authentication

**File**: `src/features/iam/authentication/authentication.decorator.ts`

```typescript
export const Authentication = (...authenticationTypes: AuthenticationType[]) =>
  SetMetadata(AUTHENTICATION_TYPE_KEY, authenticationTypes);
```

**Purpose**: Specifies authentication types required for endpoints

### RefreshToken

**File**: `src/features/iam/refresh-token.decorator.ts`

```typescript
export const RefreshToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request[REFRESH_TOKEN_KEY];
  }
);
```

**Purpose**: Extracts refresh token from request

### Roles

**File**: `src/features/iam/authorization/decorators/role.decorator.ts`

```typescript
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

**Purpose**: Specifies required roles for endpoint access

### EmailTransformer

**File**: `src/lib/decorators/email-transformer.decorator.ts`

```typescript
export function EmailTransformer(): PropertyDecorator {
  return Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value));
}
```

**Purpose**: Transforms email input to lowercase

### IsRelationId

**File**: `src/lib/decorators/is-relation-id.decorator.ts`

```typescript
export function IsRelationId(): PropertyDecorator {
  return applyDecorators(IsNumber(), IsPositive(), IsInt());
}
```

**Purpose**: Validates that a value is a valid relation ID (positive integer)

## DTOs

### SignUpDto

**File**: `src/features/iam/authentication/dto/sign-up.dto.ts`

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

**Validation**:
- Email must be valid format and is transformed to lowercase
- Password must be at least 8 characters

### SignInDto

**File**: `src/features/iam/authentication/dto/sign-in.dto.ts`

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

**Validation**: Same as SignUpDto

### RefreshTokenDto

**File**: `src/features/iam/authentication/dto/refresh-token.dto.ts`

```typescript
export class RefreshTokenDto {
  @ApiProperty()
  refreshToken: string;
}
```

### SignOutDto

**File**: `src/features/iam/authentication/dto/sign-out.dto.ts`

```typescript
export class SignOutDto {
  @ApiProperty()
  userId: number;
}
```

## Entities

### BaseEntity

**File**: `src/lib/base-entity/base-entity.ts`

```typescript
export class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('identity', {
    comment: 'Entity primary key, used as a unique identifier',
  })
  readonly id: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'Creation date',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    comment: 'Latest update date',
  })
  readonly updatedAt: Date;

  @DeleteDateColumn({
    comment: 'Soft delete date',
  })
  readonly deletedAt: Date | null;
}
```

**Features**:
- Auto-incrementing primary key
- Automatic timestamps for creation and updates
- Soft delete support

### AuthEntity

**File**: `src/features/iam/auth.entity.ts`

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

**Features**:
- Extends BaseEntity
- Password is excluded from serialization
- Email must be unique and valid format

## Filters

### DomainExceptionFilter

**File**: `src/core/filters/domain-exceptions.filter.ts`

```typescript
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost): void
}
```

**Purpose**: Global exception filter for handling domain-specific errors

## Pipes

### AdvancedValidationPipe

**File**: `src/core/pipes/advanced-validation.pipe.ts`

```typescript
@Injectable()
export class AdvancedValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      ...options,
    });
  }
}
```

**Features**:
- Removes unknown properties
- Throws error for forbidden properties
- Automatically transforms types
- Custom exception factory

## Utilities

### BaseResponse

**File**: `src/lib/base-response/base-response.ts`

```typescript
export class BaseResponse<T> {
  data?: T;
  error?: IErrorResponse;

  static async fromTaskEither<E, C extends BaseResponse<E>>(
    this: C,
    data: TaskEither<Error, E>
  ): Promise<InstanceType<C>>

  static async fromTaskEitherWithCount<E, C extends BaseResponse<E>>(
    this: C,
    data: TaskEither<Error, E>
  ): Promise<InstanceType<C>>

  static async fromPartialTaskEither<D extends object, R extends PartialTaskEither<D>>(
    this: C,
    data: R
  ): Promise<InstanceType<C>>
}
```

### BaseEntityResponse

**File**: `src/lib/base-response/base-entity-response.ts`

```typescript
export class BaseEntityResponse<Data> extends BaseResponse<Data> {
  constructor(data: Data, count?: number) {
    super();
    this.data = data;
    this.count = count;
  }
}
```

## Interfaces

### IActiveUserData

**File**: `src/features/iam/interfaces/active-user.interface.ts`

```typescript
export interface IActiveUserData {
  sub: number;      // User ID
  email: string;    // User email
  role: string;     // User role
}
```

### IAuthenticationService

**File**: `src/features/iam/authentication/authentication-service.interface.ts`

```typescript
export interface IAuthenticationService<T extends AuthEntity> {
  signUp(signUpDto: SignUpDto, user: T): TaskEither<Error, IUserIdData<T>>;
  signIn(signInDto: SignInDto): TaskEither<Error, IUserIdData<T>>;
  signOut(signOutDto: SignOutDto): TaskEither<Error, void>;
  refreshToken(refreshTokenDto: RefreshTokenDto): TaskEither<Error, ITokensData>;
}
```

### IIamModuleOptions

**File**: `src/features/iam/iam-module-options.interface.ts`

```typescript
export interface IIamModuleOptions<T extends AuthEntity> {
  entity: new () => T;
  key: string;
}
```

## Error Classes

The framework includes several custom error classes in `src/features/iam/errors/`:

### CouldNotCreateUser
- **Purpose**: Thrown when user creation fails
- **Usage**: Database errors during user registration

### CouldNotFindUser
- **Purpose**: Thrown when user lookup fails
- **Usage**: Invalid user ID or email

### CouldNotGenerateToken
- **Purpose**: Thrown when JWT token generation fails
- **Usage**: JWT signing errors

### InvalidCredentials
- **Purpose**: Thrown for authentication failures
- **Usage**: Wrong password, invalid tokens

### UserAlreadyExists
- **Purpose**: Thrown when attempting to create duplicate user
- **Usage**: Email already registered

### CouldNotUpdatePassword
- **Purpose**: Thrown when password update fails
- **Usage**: Database errors during password reset

## Constants

### IAM Constants

**File**: `src/features/iam/iam.constants.ts`

```typescript
export const AUTH_REPOSITORY_KEY = Symbol('AUTH_REPOSITORY');
export const IAM_MODULE_OPTIONS_KEY = Symbol('IAM_MODULE_OPTIONS');
export const REQUEST_USER_KEY = 'user';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const AUTHENTICATION_TYPE_KEY = 'authentication_type';
export const ROLES_KEY = 'roles';
export const RESET_PASSWORD_TOKEN_LENGTH = 64;
```

## Type Definitions

### Utility Types

**File**: `src/lib/types/utils.ts`

```typescript
export type PartialTaskEither<T extends object> = {
  [K in keyof T]: T[K] | Either<Error, T[K]> | TaskEither<Error, T[K]>;
};

export type MapStructure<T> = T extends Record<string, unknown>
  ? { [K in keyof T]: MapStructure<T[K]> }
  : T;
```

This component reference provides detailed technical documentation for every major component in the NestJS IAM framework, enabling developers to understand the implementation details and extend the framework as needed.