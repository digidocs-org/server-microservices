import { Request, Response } from 'express'
import { apiAdapter, errorResponseParser } from 'gateway/services/apiAdapter'
import { endpoints } from 'gateway/services/endpoints'

const api = apiAdapter(process.env.AUTH_SERVICE_BASE_URL!);
const authService = endpoints.authService

export const signup = async (req: Request, res: Response) => {
    try {
        const { data } = await api.post(authService.signup, req.body)
        return res.send(data)
    } catch (error) {
        return errorResponseParser(error, res)
    }
}