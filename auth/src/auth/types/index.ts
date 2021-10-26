export interface DecodedToken {
  id: string;
  type: string;
  otp?: string | number;
}

export interface IUserBody {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export const queueGroupName = 'user-service';
