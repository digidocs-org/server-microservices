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
  AADHAAR_SIGN = 'AADHAAR_SIGN',
  DIGITAL_SIGN = 'DIGITAL_SIGN',
  FIELD_REQUEST = 'FIELD_REQUEST',
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

export const enum FieldName {
  CHECKBOX = 'CHECKBOX',
  COMPANY = 'COMPANY',
  JOB_TITLE = 'JOB_TITLE',
  FULL_NAME = 'FULL_NAME',
  EMAIL = 'EMAIL',
  SIGNATURE = 'SIGNATURE',
  TEXT = 'TEXT',
  INITIALS = 'INITIALS',
  DATE = 'DATE',
}

/**
 * @desc field types
 */
export const enum FieldType {
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  CHECK_BOX = 'CHECK_BOX',
  DATE = 'DATE',
}

/**
 *@desc Auth types for recepients
 */
export const enum AuthType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  OFFLINE = 'OFFLINE',
  NONE = 'NONE',
}

/**
 * @desc Action types for recepients
 */
export const enum ActionType {
  SIGN = 'SIGN',
  VIEW = 'VIEW',
}

export const enum ActionStatus {
  SIGNED = 'SIGNED',
  VIEWED = 'VIEWED',
  DECLINED = 'DECLINED',
  RECEIVED = 'RECEIVED',
}

export const enum PaymentStatus {
  SUCCESS = 'Success',
  FAILED = 'Failure',
  CANCELLED = 'Aborted',
}
