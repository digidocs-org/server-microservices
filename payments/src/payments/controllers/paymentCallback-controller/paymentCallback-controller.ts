import { BadRequestError } from '@digidocs/guardian'
import { Request, Response } from 'express'
import PaymentOrders from 'payments-service/models/payment-orders'

export const paymentCallback = async (req: Request, res: Response) => {
    const paymentResponse = JSON.parse(req.body.response)
    const { userId } = req.body
    if (paymentResponse.error) {
        await PaymentOrders.create({
            orderId:
        })
        console.log(paymentResponse.error)
    }
    console.log(paymentResponse)
    res.send({ success: true })
}