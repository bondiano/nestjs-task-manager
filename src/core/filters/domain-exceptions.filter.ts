import { FastifyReply } from 'fastify/types/reply';

import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';

import { BaseError, getHttpCodeByException } from '@api/lib/base-http-errors';

@Catch(BaseError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: BaseError, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<FastifyReply>();

    const type = exception.getDomainType() ?? exception.getBaseType();
    const additional = exception.getAdditional();
    const code = getHttpCodeByException(exception);

    response.status(code).send({
      success: false,
      error: {
        type,
        additional,
      },
    });
  }
}
