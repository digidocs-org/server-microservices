import { BadRequestError } from '@digidocs/guardian'
import { apiAdapter, errorResponseParser } from 'authorization-service/services/apiAdapter';
import { endpoints } from 'authorization-service/types/endpoints';
import { Request, Response } from 'express'

const api = apiAdapter(process.env.PAYMENT_SERVICE_BASE_URL!);
const paymentService = endpoints.PAYMENT_ROUTES;

export const paymentCallback = async (req: Request, res: Response) => {
    try {
        const { data } = req.query
        const userId = req.currentUser?.id
        const parsedData = JSON.parse(data as string)
        const { orderId, redirectUrl, data: creditData } = parsedData

        const { data: orderData } = await api.post(paymentService.getOrderDetail, {
            orderId
        })

        if (orderData.status == "Failed") {
            return res.redirect(`${redirectUrl}?status=failed`)
        }
        //Update user credits
        return res.send(orderData.data)
    } catch (error) {
        console.log(error)
        return errorResponseParser(error, res);
    }
}