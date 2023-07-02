import { DataSource, Entity } from 'typeorm';

import { JwtModule } from '@nestjs/jwt';

import { jwtConfig } from '@api/configs/jwt.config';
import { getRightValue } from '@api/lib/fp-ts/get-right-value';
import { IDatabase, buildDataSource } from '@test/helpers/setup-database';
import { buildTestingModule } from '@test/helpers/setup-testing-module';

import { AuthEntity } from '../auth.entity';
import { AuthenticationService } from '../authentication/authentication.service';
import {
  InvalidAccessToken,
  InvalidCredentials,
  UserAlreadyExists,
} from '../errors';
import { AUTH_REPOSITORY_KEY, IAM_MODULE_OPTIONS_KEY } from '../iam.constants';
import { RefreshTokenIdsStorage } from '../refresh-token-ids.storage';

describe('AuthenticationService', () => {
  const JWTConfiguration = {
    secret: 'test',
    accessTokenTtl: '1h',
    refreshTokenTtl: '2d',
    audience: 'test',
    issuer: 'test',
  };

  @Entity()
  class User extends AuthEntity {}

  let database: IDatabase;
  let authenticationService: AuthenticationService<User>;

  beforeAll(async () => {
    database = await buildDataSource({ entities: [User] });
  });

  afterAll(async () => {
    await database.dataSource.destroy();
  });

  beforeEach(async () => {
    const testModule = await buildTestingModule(database.dataSource, {
      imports: [JwtModule.register(JWTConfiguration)],
      providers: [
        AuthenticationService,
        {
          provide: AUTH_REPOSITORY_KEY,
          useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(User),
          inject: [DataSource],
        },
        {
          provide: jwtConfig.KEY,
          useValue: JWTConfiguration,
        },
        {
          provide: IAM_MODULE_OPTIONS_KEY,
          useValue: {
            entity: User,
            key: 'user',
          },
        },
        RefreshTokenIdsStorage,
      ],
    });

    authenticationService = testModule.get(AuthenticationService);
  });

  afterEach(() => {
    database.backup.restore();
  });

  it('should be initialized', () => {
    expect(authenticationService).toBeDefined();
    expect(authenticationService).toBeInstanceOf(AuthenticationService);
  });

  it('should be able to signup and login', async () => {
    const credentials = {
      email: 'test@test.test',
      password: 'test',
    };

    const signUp = authenticationService.signUp(credentials, new User());

    const userData = await signUp();

    expect(userData).toBeRight();
    expect(userData).toEqualRight({
      tokens: expect.any(Object),
      user: expect.any(Object),
    });

    const signIn = authenticationService.signIn(credentials);

    const signInData = await signIn();

    expect(signInData).toBeRight();
    expect(signInData).toEqualRight({
      tokens: expect.any(Object),
      user: expect.any(Object),
    });
  });

  it('should be able to refresh token', async () => {
    const credentials = {
      email: 'test@test.test',
      password: 'test',
    };

    const signUp = authenticationService.signUp(credentials, new User());

    const userData = await signUp();

    expect(userData).toBeRight();
    expect(userData).toEqualRight({
      tokens: expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
      user: expect.any(Object),
    });

    const { tokens } = getRightValue(userData);

    const refreshToken = authenticationService.refreshToken({
      refreshToken: tokens.refreshToken,
    });

    const refreshTokenData = await refreshToken();

    expect(refreshTokenData).toBeRight();
    expect(refreshTokenData).toEqualRight({
      tokens: expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    });
  });

  it('should invalidate refresh token on sign out', async () => {
    const credentials = {
      email: 'test@test.test',
      password: 'test',
    };

    const signUp = authenticationService.signUp(credentials, new User());
    const userData = await signUp();

    expect(userData).toBeRight();

    const { user, tokens } = getRightValue(userData);

    const signOut = authenticationService.signOut({
      userId: user.id,
    });

    const signOutData = await signOut();

    expect(signOutData).toBeRight();

    const refreshToken = authenticationService.refreshToken({
      refreshToken: tokens.refreshToken,
    });

    const refreshTokenData = await refreshToken();

    expect(refreshTokenData).toBeLeft();
    expect(refreshTokenData).toEqualLeft(new InvalidAccessToken());
  });

  it('should return UserAlreadyExists error on sign up', async () => {
    const credentials = {
      email: 'test@test.test',
      password: 'test',
    };
    const signUp = authenticationService.signUp(credentials, new User());

    const userData = await signUp();
    expect(userData).toBeRight();

    const signUp2 = authenticationService.signUp(credentials, new User());
    const userData2 = await signUp2();

    expect(userData2).toBeLeft();
    expect(userData2).toEqualLeft(new UserAlreadyExists());
  });

  it('should return InvalidCredentials error on sign in with invalid credentials', async () => {
    const credentials = {
      email: 'test@test.test',
      password: 'test',
    };
    const signIn = authenticationService.signIn(credentials);

    const signInData = await signIn();

    expect(signInData).toBeLeft();
    expect(signInData).toEqualLeft(new InvalidCredentials());
  });

  it('should return InvalidCredentials error on sign in with wrong password', async () => {
    const credentials = {
      email: 'test2@test.test',
      password: 'test',
    };

    const signUp = authenticationService.signUp(credentials, new User());
    const userData = await signUp();

    expect(userData).toBeRight();

    const signIn2 = authenticationService.signIn({
      ...credentials,
      password: 'test2',
    });
    const signInData2 = await signIn2();

    expect(signInData2).toBeLeft();
    expect(signInData2).toEqualLeft(new InvalidCredentials());
  });
});
