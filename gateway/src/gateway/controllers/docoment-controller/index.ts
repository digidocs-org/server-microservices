import { Request, Response } from 'express';
import { apiAdapter, errorResponseParser } from 'gateway/services/apiAdapter';
import { endpoints } from 'gateway/services/endpoints';

const api = apiAdapter(process.env.DOCUMENT_SERVICE_BASE_URL!);
const documentService = endpoints.documentService;

export const index = async (req: Request, res: Response) => {
  try {
    const { data } = await api.post(documentService.index, req.body);
    return res.send(data);
  } catch (error) {
    return errorResponseParser(error, res);
  }
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { data } = await api.post(documentService.create, req.body);
    return res.send(data);
  } catch (error) {
    return errorResponseParser(error, res);
  }
};

export const sendDocument = async (req: Request, res: Response) => {
  try {
    const { data } = await api.post(documentService.send, req.body);
    return res.send(data);
  } catch (error) {
    return errorResponseParser(error, res);
  }
};
