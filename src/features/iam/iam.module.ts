import { RedisModule } from '@liaoliaots/nestjs-redis';
import { DataSource } from 'typeorm';

import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  validate,
  jwtConfig,
  JWTEnvironmentVariables,
  cryptoConfig,
  CryptoEnvironmentVariables,
  redisConfig,
  RedisEnvironmentVariables,
} from '@api/configs';
import { CryptoModule } from '@api/lib/crypto';

import { AccessTokenGuard } from './access-token.guard';
import { AuthEntity } from './auth.entity';
import { AuthenticationService } from './authentication/authentication.service';
import { IIamModuleOptions } from './iam-module-options.interface';
import { AUTH_REPOSITORY_KEY, IAM_MODULE_OPTIONS_KEY } from './iam.constants';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';

@Module({})
export class IamModule {
  static forRoot<T extends AuthEntity>(
    options: IIamModuleOptions<T>
  ): DynamicModule {
    const moduleOptions = {
      provide: IAM_MODULE_OPTIONS_KEY,
      useValue: options,
    };

    const configModule = ConfigModule.forRoot({
      validate: validate(
        JWTEnvironmentVariables,
        CryptoEnvironmentVariables,
        RedisEnvironmentVariables
      ),
      load: [jwtConfig, cryptoConfig, redisConfig],
    });

    const cryptoModule = CryptoModule.forRootAsync(cryptoConfig.asProvider());

    const typeOrmModule = TypeOrmModule.forFeature([options.entity]);

    const redisModule = RedisModule.forRootAsync(redisConfig.asProvider());

    const jwtModule = JwtModule.registerAsync(jwtConfig.asProvider());

    const userRepositoryProvider = {
      provide: AUTH_REPOSITORY_KEY,
      useFactory: (options: IIamModuleOptions<T>, connection: DataSource) => {
        return connection.getRepository(options.entity);
      },
      inject: [IAM_MODULE_OPTIONS_KEY, DataSource],
    };

    return {
      module: IamModule,
      imports: [
        cryptoModule,
        configModule,
        typeOrmModule,
        redisModule,
        jwtModule,
      ],
      providers: [
        userRepositoryProvider,
        moduleOptions,
        AccessTokenGuard,
        RefreshTokenIdsStorage,
        AuthenticationService,
      ],
      exports: [AuthenticationService],
    };
  }
}
