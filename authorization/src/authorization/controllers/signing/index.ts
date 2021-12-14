import { Request, Response } from 'express';
import {
  apiAdapter,
  errorResponseParser,
} from 'authorization-service/services/apiAdapter';
import { endpoints } from 'authorization-service/types/endpoints';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import { IDocumentActions } from 'authorization-service/models/Actions';

const api = apiAdapter(process.env.ESIGN_SERVICE_BASE_URL!);
const esignService = endpoints.SIGNING_ROUTES;

export const aadharEsignRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id
    const documentId = req.params.documentId
    const documentUserMap = await DocumentUserMap.findOne({ user: userId, document: documentId }).populate('action')
    const action = documentUserMap?.action as IDocumentActions
    const fieldData = action.fields
    const { data } = await api.post(esignService.aadharEsignRequest, {
      documentId,
      fieldData,
      redirectUrl: req.body.redirect_uri
    }, {
      headers: {
        token: req.body.token
      }
    })

    if (data.type == 'redirect') {
      return res.redirect(data.url);
    }
    return res.send(data);
  } catch (error) {
    console.log(error);
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
    const userId = req.currentUser?.id
    const documentId = req.params.documentId
    const documentUserMap = await DocumentUserMap.findOne({ user: userId, document: documentId }).populate('action')
    const action = documentUserMap?.action as IDocumentActions
    const fieldData = action.fields
    const { data } = await api.post(esignService.digitalSignRequest, {
      documentId: req.params.documentId,
      fieldData
    }, {
      headers: {
        token: req.header("token")
      }
    })
    return res.send(data);
  } catch (error) {
    return errorResponseParser(error, res);
  }
};
