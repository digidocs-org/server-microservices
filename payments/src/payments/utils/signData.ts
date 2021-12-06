import jwt from 'jsonwebtoken'
import { PaymentSignedData } from 'payments-service/types';

export const generateToken = (
    payload: PaymentSignedData,
    salt: string,
    expire: string
): string =>
    jwt.sign(payload, salt, {
        expiresIn: expire,
    });