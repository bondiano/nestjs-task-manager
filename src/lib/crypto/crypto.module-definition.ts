import { ConfigurableModuleBuilder } from '@nestjs/common';

import { ICryptoModuleOptions } from './crypto.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ICryptoModuleOptions>()
    .setClassMethodName('forRoot')
    .build();
