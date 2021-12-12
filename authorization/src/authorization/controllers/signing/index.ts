import { Request, Response } from 'express';
import {
  apiAdapter,
  errorResponseParser,
} from 'authorization-service/services/apiAdapter';
import { endpoints } from 'authorization-service/types/endpoints';

const api = apiAdapter(process.env.ESIGN_SERVICE_BASE_URL!);
const esignService = endpoints.SIGNING_ROUTES;

export const aadharEsignRequest = async (req: Request, res: Response) => {
  try {
    const { data } = await api.post(esignService.aadharEsignRequest, {
      documentId: req.params.documentId,
      redirectUrl: req.body.redirect_uri
    }, {
      headers: {
        token: req.body.token
      }
    );
    if (data.type == 'redirect') {
      return res.redirect(data.url);
    }
    return res.send(data);
  } catch (error) {
    console.log(error)
    return errorResponseParser(error, res);
  }
};

export const aadharEsignCallback = async (req: Request, res: Response) => {
  try {
    const msg = req.body.msg;
    const { data: signingData } = req.query;

    const { data } = await api.post(esignService.aadharEsignCallback, {
      espResponse: msg,
      signingData,
    });
    return res.redirect(data);
  } catch (error) {
    return errorResponseParser(error, res);
  }
};

export const digitalSignRequest = async (req: Request, res: Response) => {
  try {
    const { data } = await api.post(
      esignService.digitalSignRequest,
      {
        documentId: req.params.documentId,
      },
      {
        headers: {
          token: req.header('token'),
        },
      }
    );
    return res.send(data);
  } catch (error) {
    return errorResponseParser(error, res);
  }
};
