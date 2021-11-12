import { convertToString, SignTypes } from "@digidocs/guardian"
import { EsignRequest, Files } from 'signing-service/types'

export const createJarSigningReq = (signType: string, requestData: EsignRequest, fileName: string, responseUrl?: string,) => {

    const { tempSigningDir, pfxKey, javaAadhaarUtility, javaDigitalUtility } = Files
    const tempFileName = fileName
    const ASP_ID = process.env.ASP_ID
    const pfxFilePass = process.env.PFX_FILE_PASS

    const unsignedFilePath = `${tempSigningDir}/${tempFileName}/unsigned.pdf`;
    const responseTextFile = signType == SignTypes.AADHAR_SIGN ? `${tempSigningDir}/${tempFileName}/response.txt` : "";
    const signedFilePath = `${tempSigningDir}/${tempFileName}/unsigned_encrypt_signedFinal.pdf`;
    const signImageFilePath = `${tempSigningDir}/sign.jpeg`;
    const fieldDataFilePath = `${tempSigningDir}/${tempFileName}/field.txt`
    const timeStampFilePath = `${tempSigningDir}/${tempFileName}/unsigned_calTimeStamp.txt`
    const requestXmlFilePath = `${tempSigningDir}/${tempFileName}/unsigned_eSignRequestXml.txt`

    const data = {
        esignResponse: responseTextFile,
        unsignedPdfPath: unsignedFilePath,
        tempSignedPdfPath: signedFilePath,
        signImageFile: signImageFilePath,
        nameToShowOnStamp: requestData.name,
        locationToShowOnStamp: requestData.location,
        reasonToShowOnStamp: requestData.reason,
        pfxPath: pfxKey,
        pfxPass: process.env.PFX_FILE_PASS!,
        signFieldData: convertToString(JSON.stringify(requestData.signatureFieldData)),
        fieldDataFilePath: fieldDataFilePath
    }

    let signingRequest;

    if (signType == SignTypes.DIGITAL_SIGN) {
        signingRequest = `java -jar ${javaDigitalUtility} ${data.unsignedPdfPath} ${data.signImageFile} ${data.tempSignedPdfPath} "${data.nameToShowOnStamp}" "${requestData.location}" "${requestData.reason}" ${data.signFieldData} ${data.pfxPath} ${data.pfxPass}`
    }

    if (signType == SignTypes.ESIGN_REQUEST) {
        signingRequest = `java -jar ${javaAadhaarUtility} 1 "" ${data.unsignedPdfPath} ${ASP_ID} 1 ${responseUrl} ${pfxKey} ${pfxFilePass} ${data.signImageFile} 15 1 "${requestData.name}" "${requestData.location}" "${requestData.reason}" "" "" ${data.fieldDataFilePath}`
    }


    if (signType == SignTypes.AADHAR_SIGN) {
        signingRequest = `java -jar ${javaAadhaarUtility} 2 ${data.esignResponse} ${data.unsignedPdfPath} ${data.signImageFile} 15 "${requestData.name}" "${requestData.location}" "${requestData.reason}" "" "" ${data.fieldDataFilePath}`
    }


    return {
        unsignedFilePath,
        responseTextFile,
        signedFilePath,
        signingRequest,
        fieldDataFilePath,
        timeStampFilePath,
        tempFileName,
        requestXmlFilePath
    }
}