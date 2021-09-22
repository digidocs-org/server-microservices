import { Request, Response } from 'express'
import { apiAdapter, errorResponseParser } from 'gateway/services/apiAdapter'
import { endpoints } from 'gateway/services/endpoints'

const api = apiAdapter(process.env.AUTH_SERVICE_BASE_URL!);
const authService = endpoints.authService

export const signup = async (req: Request, res: Response) => {
    try {
        const { data } = await api.post(authService.signup, req.body)
        return res.send(data)
    } catch (error) {
        return errorResponseParser(error, res)
    }
}

export const signin = async (req: Request, res: Response) => {
    try {
        const { data } = await api.post(authService.signin, req.body)
        return res.send(data)
    } catch (error) {
        return errorResponseParser(error, res)
    }
}

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const { data } = await api.get(authService.userProfile, {
            headers: {
                token: req.header('token')
            },
        })
        return res.send(data)
    } catch (error) {
        return errorResponseParser(error, res)
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { data } = await api.get(authService.refreshToken, {
            headers: {
                token: req.header('refreshToken')
            },
        })
        return res.send(data)
    } catch (error) {
        return errorResponseParser(error, res)
    }
}

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { data } = await api.post(authService.verifyOtp, req.body, {
            headers: {
                token: req.header('token')
            },
        })
        return res.send(data)
    } catch (error) {
        return errorResponseParser(error, res)
    }
}

export const sendOTPEmail = async (req: Request, res: Response) => {
    try {
        const { data } = await api.post(authService.sendOTPEmail, req.body, {
            headers: {
                token: req.header('token')
            },
        })
        return res.send(data)
    } catch (error) {
        return errorResponseParser(error, res)
    }
}

export const sendForgotPassOtp = async (req: Request, res: Response) => {
    try {
        const { data } = await api.post(authService.sendForgotPassOTP, req.body)
        return res.send(data)
    } catch (error) {
        return errorResponseParser(error, res)
    }
}

export const forgotPasswordVerifyOtp = async (req: Request, res: Response) => {
    try {
        const { data } = await api.post(authService.verifyForgotPassOTP, req.body, {
            headers: {
                token: req.header('token')
            },
        })
        return res.send(data)
    } catch (error) {
        return errorResponseParser(error, res)
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { data } = await api.post(authService.resetPassword, req.body, {
            headers: {
                token: req.header('reset-token')
            },
        })
        return res.send(data)
    } catch (error) {
        return errorResponseParser(error, res)
    }
}

export const googleSignin = async (req: Request, res: Response) => {
   return res.redirect("http://localhost:8000/api/auth/google")
}

// export const googleSigninCallback = async (req: Request, res: Response) => {
//     try {
//         console.log("here")
//         const { data } = await api.get(authService.googleSigninCallback)
//         return res.send(data)
//     } catch (error) {
//         return errorResponseParser(error, res)
//     }
// }