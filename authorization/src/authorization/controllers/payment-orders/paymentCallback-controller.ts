import { CreditUpdateType } from '@digidocs/guardian';
import User, { IUser } from 'authorization-service/models/User';
import {
  apiAdapter
} from 'authorization-service/services/apiAdapter';
import { PaymentStatus } from 'authorization-service/types';
import { endpoints } from 'authorization-service/types/endpoints';
import { Request, Response } from 'express';
import { CreditUpdatePublisher } from 'src/events/publishers/credit-update-publisher';
import { natsWrapper } from 'src/nats-wrapper';

const api = apiAdapter(process.env.PAYMENT_SERVICE_BASE_URL!);
const paymentService = endpoints.PAYMENT_ROUTES;

export const paymentCallback = async (req: Request, res: Response) => {
  const { data } = req.query;
  const userId = req.currentUser?.id as string;
  const parsedData = JSON.parse(data as string);
  const { orderId, redirectUrl, data: creditData } = parsedData;
  const aadhaarCredits = parseInt(creditData.aadhaarCredits ?? 0)
  const digitalSignCredits = parseInt(creditData.digitalCredits ?? 0)
  try {
    const { data: orderData } = await api.post(paymentService.getOrderDetail, {
      orderId,
    });

    if (orderData.data.status == PaymentStatus.FAILED) {
      return res.redirect(`${redirectUrl}?status=failed&orderId=${orderId}`);
    }

    if (orderData.data.status == PaymentStatus.CANCELLED) {
      return res.redirect(`${redirectUrl}?status=cancelled&orderId=${orderId}`);
    }
    //Update user credits
    const user = (await User.findById(userId)) as IUser;
    user.aadhaarCredits = user.aadhaarCredits + aadhaarCredits ?? 0
    user.digitalSignCredits = user.digitalSignCredits + digitalSignCredits ?? 0
    await user.save();

    //Pulish credit update event
    new CreditUpdatePublisher(natsWrapper.client).publish({
      userId,
      data: {
        aadhaarCredits,
        digitalSignCredits
      },
      type: CreditUpdateType.ADD
    });
    return res.redirect(`${redirectUrl}?status=success&orderId=${orderId}`)
  } catch (error) {
    return res.redirect(`${redirectUrl}?status=failed&orderId=${orderId}`)
  }
};
