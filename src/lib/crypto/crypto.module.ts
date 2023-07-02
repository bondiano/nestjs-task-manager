import { Module } from '@nestjs/common';

import { ConfigurableModuleClass } from './crypto.module-definition';
import { CryptoService } from './crypto.service';

@Module({
  exports: [CryptoService],
  providers: [CryptoService],
})
export class CryptoModule extends ConfigurableModuleClass {}
