import { BadRequestError } from '@digidocs/guardian'
import { Request, Response } from 'express'

export const paymentCallback = (req: Request, res: Response) => {
    const paymentResponse = JSON.parse(req.body.response)
    if (paymentResponse.error) {
        throw new BadRequestError(paymentResponse.error)
    }
    const paymentId = paymentResponse.razorpay_payment_id
    const orderId = paymentResponse.razorpay_order_id
    const paymentSignature = paymentResponse.razorpay_signature
    const responseData = {
        paymentId,
        orderId,
        message: "payment successful",
    }
    res.send({ status: 'success', data: responseData })
}