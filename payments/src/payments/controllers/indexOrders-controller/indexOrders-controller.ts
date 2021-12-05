import { Request, Response } from 'express'
import PaymentOrders from "payments-service/models/payment-orders";

export const indexOrders = async (req: Request, res: Response) => {
    const userId = req.body.userId

    const orderList = await PaymentOrders.find({ userId })

    res.send({ success: true, data: orderList })
}