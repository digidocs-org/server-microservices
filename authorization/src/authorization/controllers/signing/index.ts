import { Request, Response } from 'express';
import { apiAdapter, errorResponseParser } from 'authorization-service/services/apiAdapter'
import { endpoints } from 'authorization-service/types/endpoints';

const api = apiAdapter(process.env.ESIGN_SERVICE_BASE_URL!);
const esignService = endpoints.SIGNING_ROUTES;

export const aadharEsignRequest = async (req: Request, res: Response) => {
  try {
    const { data } = await api.post(esignService.aadharEsignRequest, {
      documentId: req.params.id,
      redirectUrl: req.body.redirect_uri
    }, {
      headers: {
        token: req.header("token")
      }
    });
    if (data.type == "redirect") {
      return res.redirect(data.url)
    }
    return res.send(data)
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

export const digitalSignRequest = async (req: Request, res: Response) => {
  try {
    if (!req.query.token) {
      return res.status(500).send({ error: 'Token is required!!!' });
    }
    const { data } = await api.post(esignService.digitalSignRequest, {
      documentId: req.params.id,
    }, {
      headers: {
        token: req.query.token
      }
    });
    return res.send(data)
  } catch (error) {
    return errorResponseParser(error, res);
  }
};
