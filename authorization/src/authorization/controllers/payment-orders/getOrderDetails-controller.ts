import { apiAdapter, errorResponseParser } from "authorization-service/services/apiAdapter";
import { endpoints } from "authorization-service/types/endpoints";
import { Request, Response } from "express";


const api = apiAdapter(process.env.PAYMENT_SERVICE_BASE_URL!);
const paymentService = endpoints.PAYMENT_ROUTES;

export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const orderId = req.params.orderId
        const { data } = await api.post(paymentService.getOrderDetail, {
            orderId,
        });
        return res.send(data)
    } catch (error) {
        return errorResponseParser(error, res);
    }
}