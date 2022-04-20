import { Request, Response } from "express";
import { orderId } from 'payments-service/utils/orderIdGenerator'
import { encrypt, parseToQueryParam } from 'payments-service/utils'
import { generateToken } from "payments-service/utils/signData";

export const paymentRequest = (req: Request, res: Response) => {
    const { user, amount, currency, token, callbackUrl, redirectUrl, extraData } = req.body
    const { name, userId, email, phoneNo } = user

    let data = {}
    if (extraData) {
        data = extraData
    }

    const orderID = orderId.generate()
    const workingKey = process.env.CCAVENUE_WORKING_KEY!
    const accessKey = process.env.CCAVENUE_ACCESS_KEY
    const signedData = generateToken({
        callbackUrl,
        userId,
        token,
        redirectUrl,
        data
    },
        process.env.PAYMENT_SIGNING_SALT!,
        process.env.PAYMENT_SALT_EXPIRE!
    )
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
        merchant_param5: signedData
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