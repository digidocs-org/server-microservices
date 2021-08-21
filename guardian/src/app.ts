import express from 'express';
import { Request, Response, Router, Express } from 'express';
import 'express-async-errors';

import { errorHandler } from './middlewares';
import { NotFoundError } from './errors';

class App {
  private app: Express;
  constructor(private routes: Router[], private middlewares: any[]) {
    this.app = express();
    this.app.set('trust proxy', true);

    // Configure Middlewares
    this.middlewares.forEach((middleware, index, array) => {
      this.app.use(middleware);
    });

    // Configure Routes
    this.routes.forEach((route, index, array) => {
      this.app.use(route);
    });

    // If No route is found
    this.app.all('*', async (req: Request, res: Response) => {
      // console.log("URL",req.url)
      // throw new NotFoundError();
      res.send({success:req.url})
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
