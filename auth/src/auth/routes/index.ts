import { Router } from 'express';
import passport from 'passport';
import {
    Signin,
    googlePassport,
} from '../controllers/signin-controller';
import { Signup } from '../controllers/signup-controller'
import { refreshToken } from '../controllers/refreshToken-controller';
import { getUserProfile, resetPassword } from '../controllers/userProfile-controller';
import {
    sendOTPEmail,
    verifyOTP,
} from '../controllers/verifyEmail-controller';
import { forgotPasswordOtp, forgotPasswordVerifyOtp } from '../controllers/forgotPassword-controller'
import { currentUser, validateRequest, headerValidators, bodyValidators } from '@digidocs-org/guardian';
// import { verifyToken } from '../middlewares/verify-token';

export class AuthRouter {
    private static router = Router()

    public static route() {

        /**
         * @Route  POST 'api/v1/auth/signup'
         * @Desc   Signup user using email
         * @Access Public
         */

        this.router.post(
            '/signup',
            bodyValidators('email', 'password', 'firstname', 'lastname'),
            validateRequest,
            Signup
        );

        /**
         * @Route  POST 'api/v1/auth/signin'
         * @Desc   Signin user using email
         * @Access Public
         */

        this.router.post(
            '/signin',
            bodyValidators('email', 'password'),
            validateRequest,
            Signin
        );

        /**
        * @Route  GET 'api/v1/auth/user-profile'
        * @Desc   get user profile
        * @Access Private
        */

        this.router.get(
            '/user-profile',
            headerValidators('token'),
            validateRequest,
            currentUser,
            getUserProfile
        );

        /**
         * @Route  POST 'api/v1/auth/refresh-token'
         * @Desc   get new auth token
         * @Access Private
         */

        this.router.get(
            '/refresh-token',
            headerValidators('refreshToken'),
            validateRequest,
            refreshToken
        );

        /**
         * @Route  POST 'api/v1/auth/google'
         * @Desc   get google signin
         * @Access Public
         */

        this.router.get(
            '/google',
            passport.authenticate('google', {
                scope: ['profile', 'email'],
            })
        );

        /**
         * @Route  POST 'api/v1/auth/google'
         * @Desc   redirect route
         * @Access Private
         */
        this.router.get('/google/callback', passport.authenticate('google'), googlePassport);

        /**
         * @Route  POST 'api/v1/auth/verify-email'
         * @Desc   verify email route
         * @Access Private
         */
        this.router.post(
            '/verify-otp',
            headerValidators('token'),
            bodyValidators('otp'),
            validateRequest,
            currentUser,
            verifyOTP
        );

        /**
         * @Route  POST 'api/v1/auth/send-otp-email'
         * @Desc   verify email route
         * @Access Private
         */
        this.router.post(
            '/send-otp-email',
            headerValidators('token'),
            validateRequest,
            currentUser,
            sendOTPEmail
        );

        /**
         * @Route  POST 'api/v1/auth/forgotPassword/send-otp'
         * @Desc   verify email route
         * @Access Private
         */
        this.router.post(
            '/forgotPassword/send-otp',
            bodyValidators('email'),
            validateRequest,
            forgotPasswordOtp
        );

        /**
         * @Route  POST 'api/v1/auth/forgotPassword/verify-otp'
         * @Desc   verify email route
         * @Access Private
         */
        this.router.post(
            '/forgotPassword/verify-otp',
            bodyValidators('email', 'otp'),
            validateRequest,
            forgotPasswordVerifyOtp
        );

        /**
         * @Route  POST 'api/v1/auth/reset-password'
         * @Desc   verify email route
         * @Access Private
         */
        this.router.post(
            '/reset-password',
            headerValidators('reset-token'),
            bodyValidators('password'),
            validateRequest,
            verifyToken,
            resetPassword
        );
    }
}
