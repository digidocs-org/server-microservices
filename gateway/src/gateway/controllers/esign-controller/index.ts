import { Request, Response } from 'express'
import { apiAdapter, errorResponseParser } from 'gateway/services/apiAdapter'
import { endpoints } from 'gateway/services/endpoints'

const api = apiAdapter(process.env.ESIGN_SERVICE_BASE_URL!);
const esignService = endpoints.esignService

export const aadharEsignRequest = async (req: Request, res: Response) => {
    try {
        const { data } = await api.post(esignService.aadharEsignRequest, {
            documentId: req.params.id
        })
        return res.send(data)
    } catch (error) {
        return errorResponseParser(error, res)
    }
}

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
        const resType = req.query.type

        const { data } = await api.post(esignService.redirectCallback, { resType })
        return res.send(data)
    } catch (error) {
        return errorResponseParser(error, res)
    }
}

export const digitalSignRequest = async (req: Request, res: Response) => {
    try {
        const { data } = await api.post(esignService.digitalSignRequest, {
            documentId: req.params.id
        })
        return res.send(data)
    } catch (error) {
        return errorResponseParser(error, res)
    }
}
