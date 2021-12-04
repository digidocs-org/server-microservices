import { Request, Response } from 'express'
import PaymentOrders from 'payments-service/models/payment-orders'
import { decrypt, parseFromQueryParam } from 'payments-service/utils'
import jwt from 'jsonwebtoken'
import { PaymentSignedData, PaymentStatus } from 'payments-service/types'
import { PaymentSuccessPublisher } from 'src/events/publishers/payment-success-publisher'
import { natsWrapper } from 'src/nats-wrapper'

export const paymentCallback = async (req: Request, res: Response) => {
    const encryptedResponse = req.body.encResp
    const workingKey = process.env.CCAVENUE_WORKING_KEY!
    const decryptedData = decrypt(encryptedResponse, workingKey)
    const parsedData = parseFromQueryParam(decryptedData)

    const signedToken = parsedData.merchant_param2
    const decodedToken = jwt.verify(signedToken, process.env.PAYMENT_SIGNING_SALT!) as PaymentSignedData

    await PaymentOrders.create({
        orderId: parsedData.order_id,
        userId: decodedToken.userId,
        trackingId: parsedData.tracking_id,
        currency: parsedData.currency,
        amount: parsedData.amount,
        paymentMode: parsedData.payment_mode,
        modeName: parsedData.card_name,
        failureMessage: parsedData.failure_message,
        status: parsedData.order_status,
        billingInfo: {
            userName: parsedData.billing_name,
            address: parsedData.billing_address,
            city: parsedData.billing_city,
            state: parsedData.billing_state,
            pincode: parsedData.billing_zip,
            contactNumber: parsedData.billing_tel,
            email: parsedData.billing_email
        }
    })
    const token = decodedToken.token;
    const orderId = parsedData.order_id;
    const callbackUrl = decodedToken.callbackUrl
    const redirectUrl = decodedToken.redirectUrl
    const data = {
        orderId,
        redirectUrl,
        data: decodedToken.data
    }
    const params = encodeURIComponent(JSON.stringify(data))
    if (parsedData.order_status == PaymentStatus.SUCCESS) {
        new PaymentSuccessPublisher(natsWrapper.client).publish({
            orderId,
            userId: decodedToken.userId,
            data: decodedToken.data
        })
    }
    res.redirect(`${callbackUrl}?data=${params}&token=${token}`)
}