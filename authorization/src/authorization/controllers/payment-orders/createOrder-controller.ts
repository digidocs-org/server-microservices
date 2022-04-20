import { Request, Response } from 'express'
import User from 'authorization-service/models/User'
import { BadRequestError } from '@digidocs/guardian'
import { apiAdapter, errorResponseParser } from 'authorization-service/services/apiAdapter';
import { endpoints } from 'authorization-service/types/endpoints';

const api = apiAdapter(process.env.PAYMENT_SERVICE_BASE_URL!);
const paymentService = endpoints.PAYMENT_ROUTES;

export const createOrder = async (req: Request, res: Response) => {
    const userId = req.currentUser?.id
    // const userToken = req.body.token
    // const { aadhaarCredits, digitalCredits, redirectUrl } = req.body
    const { aadhaarCredits, digitalCredits, redirectUrl } = req.query
    const token = req.cookies['session'] || req.headers["token"];

    const user = await User.findById(userId)
    if (!user) {
        throw new BadRequestError("User not found")
    }
    const currency = "INR"
    const amount = parseInt(aadhaarCredits as string) * 30 + parseInt(digitalCredits as string) * 10
    const userData = {
        name: `${user.firstname} ${user.lastname}`,
        phoneNo: user.mobile,
        email: user.email,
        userId: user._id
    }

    try {
        const { data } = await api.post(paymentService.createOrder, {
            amount,
            currency,
            redirectUrl,
            token,
            user: userData,
            callbackUrl: process.env.PAYMENT_CALLBACK_URL,
            extraData: {
                aadhaarCredits,
                digitalCredits
            }
        });
        return res.send(data);
    } catch (error) {
        return errorResponseParser(error, res);
    }
}