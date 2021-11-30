import { Request, Response } from "express";
import { orderId } from 'payments-service/utils/orderIdGenerator'
import { encrypt, parseToQueryParam } from 'payments-service/utils'

export const paymentRequest = (req: Request, res: Response) => {
    const { user, amount, currency, token, callbackUrl } = req.body

    const { name, userId, email, phoneNo } = user
    const orderID = orderId.generate()
    const workingKey = process.env.CCAVENUE_WORKING_KEY!
    const accessKey = process.env.CCAVENUE_ACCESS_KEY
    const paymentData = {
        merchant_id: parseInt(process.env.CCAVENUE_MERCHANT_ID!),
        order_id: orderID,
        currency,
        amount,
        redirect_url: process.env.PAYMENT_CALLBACK,
        cancel_url: process.env.PAYMENT_CALLBACK,
        language: "EN",
        billing_name: name,
        billing_tel: phoneNo,
        billing_email: email,
        customer_identifier: userId,
        merchant_param1: "Digidocs Technologies Private Limited",
        merchant_param2: token,
        merchant_param3: callbackUrl,
        merchant_param4: userId
    }

    const parsedData = parseToQueryParam(paymentData)
    const responseBuffer = Buffer.from(parsedData)
    const encRequest = encrypt(responseBuffer, workingKey)
    res.render("paymentRequest", {
        gatewayUrl: process.env.CCAVENUE_STAGE_URL,
        encryptedData: encRequest,
        accessCode: accessKey
    })
}