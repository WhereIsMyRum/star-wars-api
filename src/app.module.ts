import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CharacterModule } from './character';

@Module({
  imports: [
    CharacterModule,
    MongooseModule.forRootAsync({
      useFactory: async () => {
        return {
          uri: 'mongodb://mongo:27017',
          dbName: 'star-wars',
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
