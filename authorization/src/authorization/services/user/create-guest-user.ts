import User from 'authorization-service/models/User';
import { BadRequestError } from '@digidocs/guardian';
import { CreateGuestUserPublisher } from 'src/events/publishers/create-guest-user-publisher';
import { natsWrapper } from 'src/nats-wrapper';

const createGuestUser = async (email: string) => {
  try {
    console.log(email);
    const guestUser = await User.create({
      isGuestUser: true,
      email: email,
    });

    new CreateGuestUserPublisher(natsWrapper.client).publish({
      _id: guestUser._id,
      email,
    });

    return guestUser._id;
  } catch (err) {
    throw new BadRequestError('Cannot create guest user!!!');
  }
};

export default createGuestUser;
