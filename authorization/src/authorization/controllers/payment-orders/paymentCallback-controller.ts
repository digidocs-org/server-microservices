import { BadRequestError } from '@digidocs/guardian'
import { Request, Response } from 'express'

export const paymentCallback = (req: Request, res: Response) => {
    const { orderId } = req.query
    // get order details from payments service and send response to user
}