const dirname = __dirname;

export const queueGroupName = 'signing-service';

export const enum EsignResponse {
  CANCELLED = 'CANCELLED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export const Files = {
  pfxKey: `${dirname}/../key/digidocs-sign.pfx`,
  javaDigitalUtility: `${dirname}/../java-esign-utility/digital-sign.jar`,
  javaAadhaarUtility: `${dirname}/../java-esign-utility/aadhaar-sign.jar`
};

export interface EsignRequest {
  name: string;
  location: string;
  reason: string;
  signatureFieldData: { data: SignField[] };
}

export interface SignField {
  pageNo: number
  xCoord: number
  yCoord: number
}

export interface AadharEsignPayload {
  signTime: string
  documentId: string
  userId: string
}
