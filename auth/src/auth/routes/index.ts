import { Router } from 'express';
import passport from 'passport';
import {
    Signin,
    googlePassport,
} from 'auth/controllers/signin-controller';
import { Signup } from 'auth/controllers/signup-controller'
import { refreshToken } from 'auth/controllers/refreshToken-controller';
import { getUserProfile, resetPassword } from 'auth/controllers/userProfile-controller';
import {
    sendOTPEmail,
    verifyOTP,
} from 'auth/controllers/verifyEmail-controller';
import { forgotPasswordOtp, forgotPasswordVerifyOtp } from 'auth/controllers/forgotPassword-controller'
import { currentUser, validateRequest, headerValidators, bodyValidators } from '@digidocs/guardian';
import { verifyToken } from 'auth/middlewares/vertfyToken';

export class AuthRouter {
    private static router = Router()

    public static route() {

        this.router.get('/api/auth', (req, res) => {
            res.send("auth service is up and running")
        })

        /**
         * @Route  POST 'api/v1/auth/signup'
         * @Desc   Signup user using email
         * @Access Public
         */

        this.router.post(
            '/api/auth/signup',
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
            '/api/auth/signin',
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
            '/api/auth/user-profile',
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
            '/api/auth/refresh-token',
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
            '/api/auth/google',
            passport.authenticate('google', {
                scope: ['profile', 'email'],
            })
        );

        /**
         * @Route  POST 'api/v1/auth/google'
         * @Desc   redirect route
         * @Access Private
         */
        this.router.get('/api/auth/google/callback', passport.authenticate('google'), googlePassport);

        /**
         * @Route  POST 'api/v1/auth/verify-email'
         * @Desc   verify email route
         * @Access Private
         */
        this.router.post(
            '/api/auth/verify-otp',
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
            '/api/auth/send-otp-email',
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
            '/api/auth/forgotPassword/send-otp',
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
            '/api/auth/forgotPassword/verify-otp',
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
            '/api/auth/reset-password',
            headerValidators('reset-token'),
            bodyValidators('password'),
            validateRequest,
            verifyToken,
            resetPassword
        );

        return this.router
    }
}
