import { BadRequestError } from "@digidocs/guardian";
import { Request, Response } from "express";
import { orderId } from 'payments-service/utils/orderIdGenerator'
import { encrypt } from 'payments-service/utils'
import { URLSearchParams } from 'url'

export const paymentRequest = (req: Request, res: Response) => {
    const { user, amount, currency, token, callbackUrl } = req.body

    const { name, userId, email, phoneNo } = user
    const orderID = orderId.generate()
    const workingKey = process.env.CCAVENUE_WORKING_KEY
    const accessKey = process.env.CCAVENUE_ACCESS_KEY
    const paymentData = {
        amount: parseInt(amount),
        currency,
        order_id: orderID,
        merchant_id: parseInt(process.env.CCAVENUE_MERCHANT_ID!),
        redirect_url: process.env.PAYMENT_CALLBACK,
        cancel_url: process.env.PAYMENT_CALLBACK,
        language: "EN",
        billing_name: name,
        billing_address: "",
        billing_city: "",
        billing_state: "",
        billing_zip: "",
        billing_country: "",
        billing_tel: phoneNo,
        billing_email: email,
        customer_identifier: userId,
        merchant_param1: token,
        merchant_param2: callbackUrl
    }

    const encRequest = encrypt(paymentData, workingKey!)
    const encryptedPaymentData = new URLSearchParams(encRequest)

    res.render("paymentRequest", {
        gatewayUrl: process.env.CCAVENUE_STAGE_URL,
        encryptedData: encryptedPaymentData,
        accessCode: accessKey
    })
}