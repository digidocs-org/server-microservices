export interface IUploadOptions {
    mime: string
    data: Buffer
    length: number
    name: string
    key: string
}

export interface IUploadResponse {
    name: string,
    key: string
}

export const enum DocumentStatus {
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    PENDING = 'PENDING',
    VOIDED = 'VOIDED',
    DRAFTS = 'DRAFTS'
}

export interface IEmailOptions {
    senderEmail: string;
    clientEmail: string;
    subject: string;
    body?: string;
}

export enum SignTypes {
    ESIGN_REQUEST = "ESIGN_REQUEST",
    AADHAR_SIGN = "AADHAR_SIGN",
    DIGITAL_SIGN = "DIGITAL_SIGN"
}
