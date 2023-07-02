import { TaskEither } from 'fp-ts/TaskEither';

import { AuthEntity } from '../auth.entity';
import { ITokens } from '../interfaces/tokens.interface';

import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignOutDto } from './dto/sign-out.dto';
import { SignUpDto } from './dto/sign-up.dto';

interface ITokensData {
  tokens: ITokens;
}

interface IUserIdData<T extends AuthEntity> extends ITokensData {
  user: T;
}

export interface IAuthenticationService<T extends AuthEntity> {
  signUp(signUpDto: SignUpDto, user: T): TaskEither<Error, IUserIdData<T>>;
  signIn(signInDto: SignInDto): TaskEither<Error, IUserIdData<T>>;
  signOut(signOutDto: SignOutDto): TaskEither<Error, void>;
  refreshToken(
    refreshTokenDto: RefreshTokenDto
  ): TaskEither<Error, ITokensData>;
}
