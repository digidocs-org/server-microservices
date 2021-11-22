import { Request, Response } from 'express'
import PaymentOrders from "payments-service/models/payment-orders";

export const indexOrders = async (req: Request, res: Response) => {
    const user = req.header('userId')

    const orderList = await PaymentOrders.find({ userId: user })

    res.send({ success: true, data: orderList })
}