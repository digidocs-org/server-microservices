import { Method } from 'axios';
import { Request, Response } from 'express';
import { apiAdapter, errorResponseParser } from 'gateway/services/apiAdapter';

const api = apiAdapter(process.env.AUTHORIZATION_SERVICE_BASE_URL!);

export const authorizationRedirect = async (req: Request, res: Response) => {
  try {
    const { data } = await api({
      url: req.path,
      data: { ...req.body, files: req.files },
      method: req.method as Method,
      headers: { ...req.headers, 'content-type': 'application/json' },
      params: req.query,
    });
    return res.send(data);
  } catch (error) {
    return errorResponseParser(error, res);
  }
};
