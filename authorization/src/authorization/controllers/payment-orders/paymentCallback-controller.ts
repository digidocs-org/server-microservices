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
    const aadhaarCredits = parseInt(creditData.aadhaarCredits)
    const digitalSignCredits = parseInt(creditData.digitalCredits)

    const { data: orderData } = await api.post(paymentService.getOrderDetail, {
      orderId,
    });

    if (orderData.status == 'Failed') {
      return res.redirect(`${redirectUrl}?status=failed`);
    }
    //Update user credits
    const user = (await User.findById(userId)) as IUser;

    if (user.aadhaarCredits) {
      user.aadhaarCredits += aadhaarCredits
    } else {
      user.aadhaarCredits = aadhaarCredits
    }

    if (user.digitalSignCredits) {
      user.digitalSignCredits += digitalSignCredits
    } else {
      user.digitalSignCredits = digitalSignCredits
    }

    await user.save();
    new CreditSuccessPublisher(natsWrapper.client).publish({
      userId,
      data: {
        aadhaarCredits,
        digitalSignCredits
      }
    });
    return res.send(orderData.data);
  } catch (error) {
    return errorResponseParser(error, res);
  }
};
