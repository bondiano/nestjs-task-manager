import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { randomUUID } from 'node:crypto';
import { PostgresError } from 'pg-error-enum';
import { FindOptionsWhere, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { InjectJWTConfig, JWTConfiguration } from '@api/configs';
import { CryptoService } from '@api/lib/crypto/crypto.service';
import { isQueryFailedError } from '@api/lib/orm/is-query-failed-error';

import { AuthEntity } from '../auth.entity';
import {
  CouldNotCreateUser,
  CouldNotFindUser,
  CouldNotGenerateToken,
  InvalidCredentials,
  UserAlreadyExists,
} from '../errors';
import { CouldNotUpdatePassword } from '../errors/could-not-update-password.error';
import { IIamModuleOptions } from '../iam-module-options.interface';
import {
  AUTH_REPOSITORY_KEY,
  IAM_MODULE_OPTIONS_KEY,
  RESET_PASSWORD_TOKEN_LENGTH,
} from '../iam.constants';
import { IActiveUserData } from '../interfaces/active-user.interface';
import { RefreshTokenIdsStorage } from '../refresh-token-ids.storage';

import { IAuthenticationService } from './authentication-service.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignOutDto } from './dto/sign-out.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthenticationService<T extends AuthEntity>
  implements IAuthenticationService<T>
{
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(AUTH_REPOSITORY_KEY)
    private readonly userRepository: Repository<T>,
    @Inject(IAM_MODULE_OPTIONS_KEY)
    private readonly iamModuleOptions: IIamModuleOptions<T>,
    @InjectJWTConfig()
    private readonly jwtConfiguration: JWTConfiguration,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage<T>
  ) {}

  signUp(signUpDto: SignUpDto, user: T) {
    return pipe(
      this.createPassword(signUpDto.password),
      TE.bindTo('password'),
      TE.bindW('user', ({ password }) =>
        this.saveUser({ ...user, email: signUpDto.email, password })
      ),
      TE.bindW('tokens', ({ user }) => this.generateTokens(user)),
      TE.map(({ user, tokens }) => ({ user, tokens }))
    );
  }

  signIn(signInDto: SignInDto) {
    return pipe(
      this.findUserByEmail(signInDto.email),
      TE.bindTo('user'),
      TE.mapLeft(() => new InvalidCredentials()),
      TE.chainFirstW(({ user }) =>
        this.validatePassword(user.password, signInDto.password)
      ),
      TE.bindW('tokens', ({ user }) => this.generateTokens(user))
    );
  }

  signOut(signOutDto: SignOutDto) {
    return TE.rightTask(() =>
      this.refreshTokenIdsStorage.invalidate(signOutDto.userId)
    );
  }

  refreshToken(refreshTokenDto: RefreshTokenDto) {
    return pipe(
      this.verifyToken<{ refreshTokenId: string }>(
        refreshTokenDto.refreshToken
      ),
      TE.bindTo('refreshTokenPayload'),
      TE.bindW('user', ({ refreshTokenPayload }) =>
        this.findUserById(refreshTokenPayload.sub)
      ),
      TE.chainW(({ user, refreshTokenPayload }) =>
        TE.fromTask(async () => {
          const isValid = await this.refreshTokenIdsStorage.validate(
            user.id,
            refreshTokenPayload.refreshTokenId
          );

          if (!isValid) {
            return TE.left(new InvalidCredentials());
          }

          await this.refreshTokenIdsStorage.invalidate(user.id);

          return TE.right(user);
        })
      ),
      TE.flattenW,
      TE.chainW((user) => this.generateTokens(user)),
      TE.map((tokens) => ({ tokens }))
    );
  }

  validatePassword(hashedPassword: string, providedPassword: string) {
    return pipe(
      TE.tryCatch(
        () => this.cryptoService.verify(hashedPassword, providedPassword),
        () => new InvalidCredentials()
      ),
      TE.chain((isValid) =>
        isValid ? TE.right(true) : TE.left(new InvalidCredentials())
      )
    );
  }

  createPassword(password: string) {
    return TE.fromTask(() => this.cryptoService.hash(password));
  }

  generateResetPasswordToken() {
    return TE.right(
      this.cryptoService.generateRandomString(RESET_PASSWORD_TOKEN_LENGTH)
    );
  }

  resetPassword(email: string, password: string) {
    return pipe(
      this.findUserByEmail(email),
      TE.bindTo('user'),
      TE.bindW('passwordHash', () => this.createPassword(password)),
      TE.chainW(({ user, passwordHash }) =>
        TE.tryCatch(
          async () => {
            await this.userRepository.update(user.id, {
              password: passwordHash,
            } as unknown as QueryDeepPartialEntity<T>);
          },
          () => new CouldNotUpdatePassword()
        )
      )
    );
  }

  findUserByEmail(email: T['email']) {
    return TE.tryCatch(
      () => {
        return this.userRepository.findOneByOrFail({
          email,
        } as FindOptionsWhere<T>);
      },
      () => new CouldNotFindUser()
    );
  }

  private saveUser(user: T) {
    return TE.tryCatch(
      () => this.userRepository.save(user),
      (reason) => {
        if (
          isQueryFailedError(reason) &&
          reason?.code === PostgresError.UNIQUE_VIOLATION
        ) {
          return new UserAlreadyExists();
        }

        this.logger.error(`Could not create user`, reason);

        return new CouldNotCreateUser();
      }
    );
  }

  private findUserById(id: T['id']) {
    return TE.tryCatch(
      () =>
        this.userRepository.findOneByOrFail({
          id,
        } as FindOptionsWhere<T>),
      () => new CouldNotFindUser()
    );
  }

  private signToken<P>(sub: T['id'], expiresIn: number, payload?: P) {
    return this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        expiresIn,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
      }
    );
  }

  private generateTokens(user: T) {
    return TE.tryCatch(
      async () => {
        const refreshTokenId = randomUUID();
        const { accessTokenTtl, refreshTokenTtl } = this.jwtConfiguration;

        const [accessToken, refreshToken] = await Promise.all([
          this.signToken<Partial<IActiveUserData>>(user.id, accessTokenTtl, {
            email: user.email,
            role: this.iamModuleOptions.key,
          }),
          this.signToken(user.id, refreshTokenTtl, { refreshTokenId }),
        ]);

        await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);

        return {
          accessToken,
          refreshToken,
        };
      },
      () => new CouldNotGenerateToken()
    );
  }

  private verifyToken<P>(token: string) {
    return TE.tryCatch(
      () =>
        this.jwtService.verifyAsync<Pick<IActiveUserData, 'sub'> & P>(token, {
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
          secret: this.jwtConfiguration.secret,
        }),
      () => new InvalidCredentials()
    );
  }
}
