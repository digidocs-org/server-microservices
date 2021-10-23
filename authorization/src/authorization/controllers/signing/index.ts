import { Request, Response } from 'express';
import { apiAdapter, errorResponseParser } from 'authorization-service/services/apiAdapter'
import { endpoints } from 'authorization-service/types/endpoints';
import { BadRequestError } from '@digidocs/guardian';

const api = apiAdapter(process.env.ESIGN_SERVICE_BASE_URL!);
const esignService = endpoints.SIGNING_ROUTES;

export const aadharEsignRequest = async (req: Request, res: Response) => {
  try {
    if (!req.query.token) {
      return res.status(500).send({ error: 'Token is required!!!' });
    }
    const { data } = await api.post(esignService.aadharEsignRequest, {
      documentId: req.params.id,
    }, {
      headers: {
        token: req.query.token
      }
    });
    return res.send(data);
  } catch (error) {
    return errorResponseParser(error, res);
  }
};

export const aadharEsignCallback = async (req: Request, res: Response) => {
  try {
    const msg = req.body.msg
    const { data: signingData } = req.query

    const { data } = await api.post(esignService.aadharEsignCallback, {
      espResponse: msg,
      signingData
    })
    return res.redirect(data)
  } catch (error) {
    return errorResponseParser(error, res)
  }
}

export const redirectCallback = async (req: Request, res: Response) => {
  try {
    const resType = req.query.type;

    const { data } = await api.post(esignService.redirectCallback, { resType });
    return res.redirect(data);
  } catch (error) {
    return errorResponseParser(error, res);
  }
};

export const digitalSignRequest = async (req: Request, res: Response) => {
  try {
    const { data } = await api.post(esignService.digitalSignRequest, {
      documentId: req.params.id,
    }, {
      headers: {
        token: req.header('token')
      }
    });
    console.log(data)
    return res.redirect(data);
  } catch (error) {
    return errorResponseParser(error, res);
  }
};
