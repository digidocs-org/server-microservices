import Axios from 'axios';
import { Response } from 'express';

export const apiAdapter = (baseURL: string) => {
  return Axios.create({
    baseURL,
  });
};

export const errorResponseParser = (error: any, res: Response) => {
  if (error.response) {
    const { data, status } = error.response;
    console.log(data)
    return res.status(status).send(data);
  }
  return res.status(500).send({ error: 'Something went wrong' });
};
