import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CharacterService, CharacterServiceToken } from './application';
import { CharacterFactory, CharacterFactoryToken } from './domain/factories';
import { CharacterModelsTokens, CharacterSchema } from './infrastructure';
import {
  CharacterRepository,
  CharacterRepositoryToken,
} from './infrastructure/repositories';
import { CharacterController } from './user-interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CharacterModelsTokens.character,
        schema: CharacterSchema,
      },
    ]),
  ],
  controllers: [CharacterController],
  providers: [
    {
      provide: CharacterFactoryToken,
      useClass: CharacterFactory,
    },
    {
      provide: CharacterServiceToken,
      useClass: CharacterService,
    },
    {
      provide: CharacterRepositoryToken,
      useClass: CharacterRepository,
    },
  ],
})
export class CharacterModule {}
