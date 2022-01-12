import { Context } from 'aws-lambda';
import { Response, createServer, proxy } from 'aws-serverless-express';
import * as express from 'express';
import { Server } from 'http';

import { bootstrapApp } from './app';

let cachedServer: Server;

async function bootstrap(): Promise<Server> {
  if (!cachedServer) {
    const expressApp = express();
    const app = await bootstrapApp(expressApp);

    await app.init();

    cachedServer = createServer(expressApp);
  }

  return cachedServer;
}

export async function handler(event: any, context: Context): Promise<Response> {
  cachedServer = await bootstrap();

  event.path = mapSwaggerPath(event.path);

  return proxy(cachedServer, event, context, 'PROMISE').promise;
}

function mapSwaggerPath(eventPath: string): string {
  if (eventPath === '/api/swagger') {
    return '/dev/api/swagger/';
  } else if (eventPath.match('/api/swagger-ui')) {
    return eventPath.replace('/api/swagger-ui', '/dev/api/swagger/swagger-ui');
  }

  return eventPath;
}
