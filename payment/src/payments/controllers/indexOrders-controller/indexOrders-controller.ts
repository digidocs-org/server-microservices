import { BadRequestError } from '@digidocs/guardian';
import { Request, Response } from 'express'
import PaymentOrders from "payments-service/models/payment-orders";

export const indexOrders = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId

        const orderList = await PaymentOrders.find({ userId })

        res.send({ success: true, data: orderList })
    } catch (error) {
        console.log(error)
        throw new BadRequestError("Something went wrong")
    }

}