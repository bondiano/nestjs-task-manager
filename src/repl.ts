import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import lodash from 'lodash';
import path from 'node:path';

import { repl } from '@nestjs/core';

import { AppModule } from '@api/app/app.module';

async function bootstrap() {
  const replServer = await repl(AppModule);

  replServer.context.l = lodash;
  replServer.context.path = path;
  replServer.context.E = E;
  replServer.context.TE = TE;

  replServer.setupHistory('.nestjs_repl_history', (error) => {
    if (error) {
      console.error(error);
    }
  });
}

bootstrap();
