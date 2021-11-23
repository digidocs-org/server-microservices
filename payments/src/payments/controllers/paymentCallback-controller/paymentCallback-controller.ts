import { BadRequestError } from '@digidocs/guardian'
import { Request, Response } from 'express'

export const paymentCallback = (req: Request, res: Response) => {
    const paymentResponse = JSON.parse(req.body.response)
    const { userId } = req.body
    if (paymentResponse.error) {
        console.log(paymentResponse.error)
    }
    console.log(paymentResponse)
    res.send({ success: true })
}