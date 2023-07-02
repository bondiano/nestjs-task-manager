# Crypto

## Usage

### Module Initialization

```typescript
import { CryptoModule, ICryptoModuleOptions } from '@api/lib/crypto';

const buildCryptoConfig = (
  configService: ConfigService
): ICryptoModuleOptions => ({
  salt: configService.get<string>('AUTH_SALT'),
});

@Module({
  imports: [
    CryptoModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: buildCryptoConfig,
    }),
  ],
  controllers: [SomeController],
  providers: [SomeService],
})
export class SomeModule {}
```

### To hash a password

```typescript
  const plainPassword = 'qwerty123';
  const hashedPassword = await cryptoService.hash(plainPassword);
```

### To check a password

```typescript
  const correctPlainPassword = 'qwerty123';
  const hashedPassword = await cryptoService.hash(correctPlainPassword);

  const isPasswordMatching = await cryptoService.verify(
    hashedPassword,
    correctPlainPassword
  ) // isPasswordMatching === true

    const isPasswordMatching = await cryptoService.verify(
    hashedPassword,
    wrongPlainPassword
  ) // isPasswordMatching === false
```

### Generate random code

```typescript
  const randomCodeLength = 6
  const confirmationCode = cryptoService.generateRandomCode(randomCodeLength);
  // confirmationCode - a random string of length 6, containing only digits
  // for example: "351593"
```
