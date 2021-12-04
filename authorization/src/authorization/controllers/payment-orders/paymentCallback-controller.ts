import { BadRequestError, CreditType } from '@digidocs/guardian';
import User, { IUser } from 'authorization-service/models/User';
import {
  apiAdapter,
  errorResponseParser,
} from 'authorization-service/services/apiAdapter';
import { endpoints } from 'authorization-service/types/endpoints';
import { Request, Response } from 'express';
import { CreditSuccessPublisher } from 'src/events/publishers/credit-success-publisher';
import { natsWrapper } from 'src/nats-wrapper';

const api = apiAdapter(process.env.PAYMENT_SERVICE_BASE_URL!);
const paymentService = endpoints.PAYMENT_ROUTES;

export const paymentCallback = async (req: Request, res: Response) => {
  try {
    const { data } = req.query;
    const userId = req.currentUser?.id as string;
    const parsedData = JSON.parse(data as string);
    const { orderId, redirectUrl, data: creditData } = parsedData;

    const { data: orderData } = await api.post(paymentService.getOrderDetail, {
      orderId,
    });

    if (orderData.status == 'Failed') {
      return res.redirect(`${redirectUrl}?status=failed`);
    }
    //Update user credits
    const user = (await User.findById(userId)) as IUser;

    if (orderData.creditType === CreditType.AADHAR) {
      user.aadhaarCredits += orderData.credits;
    } else if (orderData.creditType === CreditType.DIGITAL) {
      user.digitalSignCredits += orderData.credits;
    }

    await user.save();
    new CreditSuccessPublisher(natsWrapper.client).publish({
      userId,
      creditType: orderData.creditType,
      credits: orderData.credits,
    });
    return res.send(orderData.data);
  } catch (error) {
    console.log(error);
    return errorResponseParser(error, res);
  }
};
