const dirname = __dirname;

export const queueGroupName = 'signing-service';

export const enum EsignResponse {
  CANCELLED = 'CANCELLED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export const Files = {
  pfxKey: `${dirname}/../key/digidocs-sign.pfx`,
  javaDigitalUtilityV2: `${dirname}/../java-esign-utility/digital-sign-v2.jar`,
  javaAadhaarUtility: `${dirname}/../java-esign-utility/aadhaar-sign.jar`,
  tempSigningDir: `${dirname}/../sign-dir`
};

export interface EsignRequest {
  name: string;
  location: string;
  reason: string;
  signatureFieldData?: { data: SignField[] };
}

export interface SignField {
  dataX: number
  dataY: number
  height: number
  width: number
  pageNumber: number
}

export interface AadharEsignPayload {
  documentId: string
  userId: string
  redirectUrl: string
  calTimeStamp: string
  fieldData: any
}
