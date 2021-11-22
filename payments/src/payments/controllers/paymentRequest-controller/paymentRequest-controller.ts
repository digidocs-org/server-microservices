import { BadRequestError } from "@digidocs/guardian";
import { Request, Response } from "express";
import Razorpay from 'razorpay'

export const paymentRequest = (req: Request, res: Response) => {
    const { user, amount, currency, token, callbackUrl } = req.body

    const { name, email, phoneNo } = user

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })

    const paymentOptions = {
        amount,
        currency
    }
    razorpay.orders.create(paymentOptions, function (err: any, order: any) {
        if(err){
            throw new BadRequestError("payment failed!!!")
        }
        const orderId: string = order.id

        res.render('paymentRequest.ejs', {
            orderId,
            amount,
            currency,
            name,
            email,
            phoneNo,
            token,
            callbackUrl
        })
    });
}