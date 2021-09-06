import {Request, Response} from 'express';

const getRecipients = (req: Request, res: Response) => {
  return res.send({success: true, data: {message: 'Yeah that worked'}});
};

export default getRecipients;
