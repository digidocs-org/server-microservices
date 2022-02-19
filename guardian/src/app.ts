import express from 'express';
import { Request, Response, Router, Express } from 'express';
import cookieParser from 'cookie-parser';
import 'express-async-errors';

import { errorHandler } from './middlewares';
import { NotFoundError } from './errors';

class App {
  private app: Express;
  constructor(
    private routes: Router[],
    private middlewares: any[],
    private views?: { viewPath: string; engine: string }[]
  ) {
    this.app = express();
    this.app.set('trust proxy', true);

    if (this.views) {
      this.views.forEach(data => {
        this.app.set('views', data.viewPath);
        this.app.set('view engine', data.engine);
      });
    }

    // Configure Middlewares
    this.app.use(cookieParser());
    this.middlewares.forEach((middleware, index, array) => {
      this.app.use(middleware);
    });

    // Configure Routes
    this.routes.forEach((route, index, array) => {
      this.app.use(route);
    });

    // If No route is found
    this.app.all('*', async (req: Request, res: Response) => {
      throw new NotFoundError();
    });

    // Error Handler
    this.app.use(errorHandler);
  }

  public start(portNumber: number) {
    this.app.listen(portNumber);
    console.log(`Server listening on ${portNumber}.`);
  }

  public getApp() {
    return this.app;
  }
}

export { App };
