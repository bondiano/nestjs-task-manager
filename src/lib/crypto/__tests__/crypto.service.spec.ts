import { Test } from '@nestjs/testing';

import { CryptoModule } from '../crypto.module';
import { CryptoService } from '../crypto.service';

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        CryptoModule.forRootAsync({
          useFactory: () => ({ salt: 'some-salt' }),
        }),
      ],
    }).compile();

    cryptoService = testModule.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(cryptoService).toBeDefined();
  });

  it('should salt password', async () => {
    const plainPassword = 'qwerty123';
    const hashedPassword = await cryptoService.hash(plainPassword);
    const isPasswordMatching = await cryptoService.verify(
      hashedPassword,
      plainPassword
    );
    expect(isPasswordMatching).toBeTruthy();
  });

  it('should generate random base64 string', () => {
    const bytes = 32;
    const expectedBase64Length = 44;

    const generatedRandomCode = cryptoService.generateRandomString(bytes);

    expect(() => atob(generatedRandomCode)).not.toThrow();
    expect(generatedRandomCode.length).toBe(expectedBase64Length);
  });

  it('should generate random decimal code', () => {
    const length = 5;

    const generatedRandomCode = cryptoService.generateRandomCode(length);

    expect(() => Number(generatedRandomCode)).not.toThrow();
    expect(generatedRandomCode.length).toBe(length);
  });
});
