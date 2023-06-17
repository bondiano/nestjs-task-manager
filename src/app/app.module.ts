/* eslint-disable unicorn/prefer-module */

import { Module } from '@nestjs/common';

import { CoreModule } from '@api/core/core.module';
import { FeaturesModule } from '@api/features/features.module';

import { AppController } from './app.controller';

@Module({
  imports: [FeaturesModule, CoreModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
