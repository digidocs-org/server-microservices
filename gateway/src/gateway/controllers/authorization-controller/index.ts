import { Request, Response } from 'express';
import { apiAdapter, errorResponseParser } from 'gateway/services/apiAdapter';
import { endpoints } from 'gateway/types/endpoints';


export const authorizationRedirect = async (req: Request, res: Response) => {
  try {
    console.log(req.path)
  } catch (error) {
      
  }
};
