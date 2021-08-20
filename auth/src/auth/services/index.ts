import { IUserBody } from "../types";
import User from '../models'
import { BadRequestError } from "@digidocs-org/guardian";
import bcrypt from 'bcryptjs';
import { generateToken } from "../utils";

export class AuthService {
    public static async createUser(userData: IUserBody) {
        const { email, password, firstname, lastname } = userData

        let user = await User.findOne({ email });
        if (user) {
            throw new BadRequestError('User already Exists!!');
        }

        user = new User({ email, firstname, lastname });
        // hash pwd
        const salt = await bcrypt.genSalt(10);
        user.password = bcrypt.hashSync(password, salt);
        user.isPass = true;
        await user.save();

        const { id, __v } = user;

        const payload = {
            id,
            __v,
        };
        const accessToken = generateToken(
            payload,
            process.env.ACCESS_TOKEN_SECRET!,
            process.env.ACCESS_TOKEN_EXP!
        );
        const refreshToken = generateToken(
            payload,
            process.env.REFRESH_TOKEN_SECRET!,
            process.env.REFRESH_TOKEN_EXP!
        );
        user.refreshToken = refreshToken;
        await user.save();

        return { accessToken, refreshToken }
    }
}