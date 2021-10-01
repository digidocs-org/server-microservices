import {
  bodyValidators,
  headerValidators,
  validateRequest,
} from '@digidocs/guardian';
import { Router } from 'express';
import {
  signup,
  signin,
  getUserProfile,
  refreshToken,
  verifyOtp,
  sendOTPEmail,
  forgotPasswordVerifyOtp,
  resetPassword,
  sendForgotPassOtp,
  googleSignin,
} from 'gateway/controllers/auth-controller';

const router = Router();

/**
 * @Route  POST 'api/v1/auth/signup'
 * @Desc   Signup user using email
 * @Access Public
 */

router.post(
  '/signup',
  bodyValidators('email', 'password', 'firstname', 'lastname'),
  validateRequest,
  signup
);

/**
 * @Route  POST 'api/v1/auth/signin'
 * @Desc   Signin user using email
 * @Access Public
 */

router.post(
  '/signin',
  bodyValidators('email', 'password'),
  validateRequest,
  signin
);

/**
 * @Route  GET 'api/v1/auth/user-profile'
 * @Desc   get user profile
 * @Access Private
 */

router.get(
  '/user-profile',
  headerValidators('token'),
  validateRequest,
  getUserProfile
);

/**
 * @Route  POST 'api/v1/auth/refresh-token'
 * @Desc   get new auth token
 * @Access Private
 */

router.get(
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

router.get('/google', googleSignin);

/**
 * @Route  POST 'api/v1/auth/verify-email'
 * @Desc   verify email route
 * @Access Private
 */
router.post(
  '/verify-otp',
  headerValidators('token'),
  bodyValidators('otp'),
  validateRequest,
  verifyOtp
);

/**
 * @Route  POST 'api/v1/auth/send-otp-email'
 * @Desc   verify email route
 * @Access Private
 */
router.post(
  '/send-otp-email',
  headerValidators('token'),
  validateRequest,
  sendOTPEmail
);

/**
 * @Route  POST 'api/v1/auth/forgotPassword/send-otp'
 * @Desc   verify email route
 * @Access Private
 */
router.post(
  '/forgotPassword/send-otp',
  bodyValidators('email'),
  validateRequest,
  sendForgotPassOtp
);

/**
 * @Route  POST 'api/v1/auth/forgotPassword/verify-otp'
 * @Desc   verify email route
 * @Access Private
 */
router.post(
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
router.post(
  '/reset-password',
  headerValidators('reset-token'),
  bodyValidators('password'),
  validateRequest,
  resetPassword
);

export = router;
