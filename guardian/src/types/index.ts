export interface IUploadOptions {
  mime: string;
  data: Buffer;
  length: number;
  name: string;
  key: string;
  contentEncoding?: string;
}

export interface IUploadResponse {
  name: string;
  key: string;
}

export const enum DocumentStatus {
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  VOIDED = 'VOIDED',
  DRAFTS = 'DRAFTS',
}

export interface IEmailOptions {
  clientEmail: string;
  subject: string;
  body?: string;
}

export enum SignTypes {
  ESIGN_REQUEST = 'ESIGN_REQUEST',
  AADHAR_SIGN = 'AADHAR_SIGN',
  AADHAAR_SIGN= 'AADHAAR_SIGN',
  DIGITAL_SIGN = 'DIGITAL_SIGN',
  FIELD_REQUEST = 'FIELD_REQUEST'
}

export enum CreditUpdateType {
  ADDED = 'ADDED',
  SUBTRACTED = 'SUBTRACTED',
}

export enum Templates {
  WELCOME = 'welcome',
  OTP = 'otp',
  GENERAL = 'general',
  BUTTON = 'button',
}
