import * as express from 'express';

import { bootstrapApp } from './app';

async function bootstrap() {
  const expressApp = express();

  const app = await bootstrapApp(expressApp);

  await app.listen(3000);
}
bootstrap();
