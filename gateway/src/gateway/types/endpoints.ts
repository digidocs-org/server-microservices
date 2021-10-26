export const endpoints = {
  authService: {
    signup: '/api/auth/signup',
    signin: '/api/auth/signin',
    userProfile: '/api/auth/user-profile',
    refreshToken: '/api/auth/refresh-token',
    verifyOtp: '/api/auth/verify-otp',
    sendOTPEmail: '/api/auth/send-otp-email',
    sendForgotPassOTP: '/api/auth/forgotPassword/send-otp',
    verifyForgotPassOTP: '/api/auth/forgotPassword/verify-otp',
    resetPassword: '/api/auth/reset-password',
    googleSignin: '/api/auth/google',
    googleSigninCallback: '/api/auth/google/callback',
  },
  authorizationService: {
    
  },
};
