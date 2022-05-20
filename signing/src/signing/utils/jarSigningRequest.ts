import { convertToString, SignTypes } from "@digidocs/guardian"
import { AadhaarSigningData, EsignRequest, Files, KMSKeyPath } from 'signing-service/types'
import { v4 as uuid } from 'uuid'

export const createJarSigningReq = (signType: string, requestData: EsignRequest, aadhaarSigningData?: AadhaarSigningData) => {

    const { tempSigningDir, pfxKey, digidocsEsignUtilityV2, stageCertificate, kmsAccessKey } = Files
    const { stage: stageHSMKeyPath, prod: prodHSMKeyPath } = KMSKeyPath

    const tempFileName = `temp-${uuid()}`

    const unsignedFilePath = `${tempSigningDir}/${tempFileName}/unsigned.pdf`;
    const signedFilePath = `${tempSigningDir}/${tempFileName}/signed.pdf`;
    const unsignedFieldPath = `${tempSigningDir}/${tempFileName}/unsigned_field.pdf`
    const signImageFilePath = `${tempSigningDir}/${tempFileName}/sign.png`
    const responseTextFile = `${tempSigningDir}/${tempFileName}/response.txt`

    const data = {
        unsignedPdfPath: convertToString(unsignedFilePath),
        tempSignedPdfPath: convertToString(signedFilePath),
        signImageFile: convertToString(signImageFilePath),
        nameToShowOnStamp: convertToString(requestData?.name),
        pfxPath: convertToString(pfxKey),
        pfxPass: convertToString(process.env.PFX_FILE_PASS!),
        signFieldData: convertToString(convertToString(requestData.signatureFieldData)),
        kmsAccessKey: convertToString(kmsAccessKey),
        stageHSMKeyPath: convertToString(stageHSMKeyPath),
        prodHSMKeyPath: convertToString(prodHSMKeyPath),
        stageCertificate: convertToString(stageCertificate),
        xmlResponse: convertToString(responseTextFile),
        timestamp: convertToString(aadhaarSigningData?.timestamp)
    }

    let signingRequest;

    if (signType == SignTypes.DIGITAL_SIGN) {
        signingRequest = `java -jar ${digidocsEsignUtilityV2} ${SignTypes.DIGITAL_SIGN} ${data.unsignedPdfPath} ${data.nameToShowOnStamp} ${data.kmsAccessKey} ${data.stageHSMKeyPath} ${data.stageCertificate} ${data.signFieldData} `
    }

    if (signType == SignTypes.FIELD_REQUEST) {
        signingRequest = `java -jar ${digidocsEsignUtilityV2} ${SignTypes.FIELD_REQUEST} ${data.unsignedPdfPath} "" "" ${data.nameToShowOnStamp} ${data.signFieldData}`
    }

    if (signType == SignTypes.AADHAAR_SIGN) {
        signingRequest = `java -jar ${digidocsEsignUtilityV2} ${SignTypes.AADHAAR_SIGN} ${data.unsignedPdfPath} ${data.xmlResponse} ${data.timestamp} ${data.nameToShowOnStamp} ${data.signFieldData}`
    }


    return {
        unsignedFilePath,
        signedFilePath,
        signingRequest,
        tempFileName,
        unsignedFieldPath,
        signImageFilePath,
        responseTextFile
    }
}