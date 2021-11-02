import { convertToString, SignTypes } from "@digidocs/guardian"
import { EsignRequest, Files } from 'signing-service/types'
import { v4 as uuidv4 } from 'uuid'

export const createJarSigningReq = (rootDir: string, signType: string, requestData: EsignRequest) => {
    const tempFileName = uuidv4();
    const unsignedFilePath = `${rootDir}/temp-${tempFileName}/unsigned.pdf`;
    const responseTextFile = signType == SignTypes.AADHAR_SIGN ? `${rootDir}/temp-${tempFileName}/response.txt` : "";
    const signedFilePath = `${rootDir}/temp-${tempFileName}/signed.pdf`;
    const signImageFilePath = `${rootDir}/sign.jpeg`;
    const unsignedFieldPath = `${rootDir}/temp-${tempFileName}/sample_encryptTempSigned.pdf`
    const pfxFilePass = process.env.PFX_FILE_PASS
    const fieldDataFilePath = `${rootDir}/temp-${tempFileName}/field.pdf`

    const data = {
        esignResponse: convertToString(responseTextFile),
        unsignedPdfPath: convertToString(unsignedFilePath),
        tempSignedPdfPath: convertToString(signedFilePath),
        signImageFile: convertToString(signImageFilePath),
        nameToShowOnStamp: convertToString(requestData.name),
        locationToShowOnStamp: convertToString(requestData.location),
        reasonToShowOnStamp: convertToString(requestData.reason),
        unsignedFieldPath: convertToString(unsignedFieldPath),
        date: convertToString(requestData.timeOfDocSign),
        docId: convertToString(requestData.docId.toString()),
        pfxPath: convertToString(Files.pfxKey),
        pfxPass: convertToString(process.env.PFX_FILE_PASS!),
        signFieldData: JSON.stringify(convertToString(requestData.signatureFieldData)),
        fieldDataFilePath: convertToString(fieldDataFilePath)
    }

    let signingRequest;
    
    if (signType == SignTypes.DIGITAL_SIGN) {
        signingRequest = `java -jar ${Files.javaDigitalUtility} ${data.unsignedPdfPath} ${data.signImageFile} ${data.tempSignedPdfPath} "${requestData.name}" "${requestData.location}" "${requestData.reason}" ${data.date} ${data.docId} ${data.signFieldData} ${data.pfxPath} ${data.pfxPass}`
    }

    if(signType == SignTypes.AADHAR_SIGN){
        signingRequest = `java -jar ${Files.javaAadhaarUtility} 1 ${data.unsignedPdfPath} "" 1 "" ${Files.pfxKey} ${pfxFilePass} ${data.signImageFile} 15 1 "${requestData.name}" "${requestData.location}" "${requestData.reason}" "" "" ${data.fieldDataFilePath}`
    }


    return {
        unsignedFilePath,
        responseTextFile,
        signedFilePath,
        unsignedFieldPath,
        signingRequest
    }
}