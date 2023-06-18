import os from 'node:os';

import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
@ApiTags('Health Check')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private database: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const totalMemory = os.totalmem();

    return this.health.check([
      () => this.database.pingCheck('database'),
      () =>
        this.memory.checkRSS(
          'memory_rss',
          totalMemory * 0.9 /* 90% of total memory */
        ),
    ]);
  }
}
