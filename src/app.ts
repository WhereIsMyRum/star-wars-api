import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { Express } from 'express';

import { AppModule } from './app.module';

export async function bootstrapApp(
  expressApp: Express,
): Promise<INestApplication> {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  const config = getSwaggerConfig();

  app.setGlobalPrefix('/api');

  SwaggerModule.setup(
    '/dev/api/swagger',
    app,
    SwaggerModule.createDocument(app, config),
  );

  return app;
}

function getSwaggerConfig(): Omit<OpenAPIObject, 'paths'> {
  return new DocumentBuilder()
    .setTitle('Star Wars Serverless API')
    .setDescription('The Star Wars Serverless API documentation')
    .setVersion('1.0')
    .build();
}
