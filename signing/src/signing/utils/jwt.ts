import jwt from 'jsonwebtoken'
import { AadharEsignPayload } from 'signing-service/types';

export const generateToken = (
    payload: AadharEsignPayload,
    salt: string,
    expire: string,
): string =>
    jwt.sign(payload, salt, {
        expiresIn: expire,
    });