import { Subjects } from '../subjects';

export interface CreateGuestUserEvent {
  subject: Subjects.CreateGuestUser;

  data: {
    _id: string;
    email: string;
  };
}
