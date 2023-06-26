import {
  HealthCheckService,
  HealthIndicatorFunction,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from '../health.controller';

const getStatus = (key: string) => ({ [key]: { status: 'up' } });

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    })
      .useMocker((token) => {
        if (Object.is(token, HealthCheckService)) {
          return {
            check: jest
              .fn()
              .mockImplementation(
                (indicators: Array<HealthIndicatorFunction>) =>
                  Promise.all(indicators.map((indicator) => indicator()))
              ),
          };
        }

        if (Object.is(token, TypeOrmHealthIndicator)) {
          return {
            pingCheck: jest.fn().mockImplementation(getStatus),
          };
        }

        if (Object.is(token, TypeOrmHealthIndicator)) {
          return {
            pingCheck: jest.fn().mockImplementation(getStatus),
          };
        }

        if (Object.is(token, MemoryHealthIndicator)) {
          return {
            checkHeap: jest.fn().mockImplementation(getStatus),
            checkRSS: jest.fn().mockImplementation(getStatus),
          };
        }
      })
      .compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should check health', async () => {
    await expect(controller.check()).resolves.toMatchSnapshot();
  });
});
