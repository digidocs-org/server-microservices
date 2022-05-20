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
  tempSigningDir: `${dirname}/../sign-dir`,
  digidocsEsignUtilityV2: `${dirname}/../java-esign-utility/esign-utility-v2.jar`,
  stageCertificate: `${dirname}/../java-esign-utility/certificate-digidocs-stage.cer`,
  kmsAccessKey: `${dirname}/../java-esign-utility/cloud-key-access.json`
};

export enum KMSKeyPath{
  stage = "projects/digidocs-stage/locations/asia-south1/keyRings/digidocs-prod-keyring/cryptoKeys/digidocs-stage-key/cryptoKeyVersions/1",
  prod = "projects/digidocs-stage/locations/asia-south1/keyRings/digidocs-prod-keyring/cryptoKeys/digidocs-prod-key/cryptoKeyVersions/4"
}

export interface EsignRequest {
  name?: string;
  location?: string;
  reason?: string;
  signatureFieldData?: { data: SignField[] };
}

export interface AadhaarSigningData {
  timestamp: string
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
