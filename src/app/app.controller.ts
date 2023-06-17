import { FastifyRequest } from 'fastify';
import { hostname } from 'node:os';

import { Controller, Get, Req } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('container')
  getContainer(@Req() request: FastifyRequest) {
    return {
      ip: request.ip,
      hostname: hostname(),
    };
  }
}
