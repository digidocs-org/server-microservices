const dirname = __dirname;

export const queueGroupName = "signing-service"

export const enum EsignResponse {
    CANCELLED = 'CANCELLED',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
  }

export const Files = {
  pfxKey: `${dirname}/../key/digidocs-sign.pfx`,
  javaUtility: `${dirname}/../java-esign-utility/esign-java-utility.jar`
}

export interface EsignRequest {
  name: string
  location: string
  reason: string,
  signatureFieldData: { data: [SignField] }
}

export interface SignField {
  pageNo: number
  xCoord: number 
  yCoord: number 
}