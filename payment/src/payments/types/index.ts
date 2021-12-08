export enum PaymentStatus {
    SUCCESS = "Success",
    FAILED = "Failure",
}

export interface PaymentSignedData {
    callbackUrl: string
    redirectUrl: string
    userId: string
    data?: any
    token: string
}