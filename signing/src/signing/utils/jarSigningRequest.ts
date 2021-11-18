import { convertToString, SignTypes } from "@digidocs/guardian"
import { EsignRequest, Files } from 'signing-service/types'

export const createJarSigningReq = (signType: string, requestData: EsignRequest, fileName: string, responseUrl?: string,) => {

    const { tempSigningDir, pfxKey, javaAadhaarUtility, javaDigitalUtility } = Files
    const tempFileName = fileName
    const ASP_ID = process.env.ASP_ID
    const pfxFilePass = process.env.PFX_FILE_PASS

    const unsignedFilePath = `${tempSigningDir}/${tempFileName}/unsigned.pdf`;
    const responseTextFile = signType == SignTypes.AADHAR_SIGN ? `${tempSigningDir}/${tempFileName}/response.txt` : "";
    const signedFilePath = `${tempSigningDir}/${tempFileName}/unsigned_signedFinal.pdf`;
    const signImageFilePath = `${tempSigningDir}/sign.png`;
    const fieldDataFilePath = `${tempSigningDir}/${tempFileName}/field.txt`
    const timeStampFilePath = `${tempSigningDir}/${tempFileName}/unsigned_calTimeStamp.txt`
    const requestXmlFilePath = `${tempSigningDir}/${tempFileName}/unsigned_eSignRequestXml.txt`

    const data = {
        esignResponse: convertToString(responseTextFile),
        unsignedPdfPath: convertToString(unsignedFilePath),
        tempSignedPdfPath: convertToString(signedFilePath),
        signImageFile: convertToString(signImageFilePath),
        nameToShowOnStamp: convertToString(requestData.name),
        locationToShowOnStamp: convertToString(requestData.location),
        reasonToShowOnStamp: convertToString(requestData.reason),
        pfxPath: convertToString(pfxKey),
        pfxPass: convertToString(process.env.PFX_FILE_PASS!),
        signFieldData: convertToString(convertToString(requestData.signatureFieldData)),
        fieldDataFilePath: convertToString(fieldDataFilePath)
    }

    let signingRequest;

    if (signType == SignTypes.DIGITAL_SIGN) {
        signingRequest = `java -jar ${javaDigitalUtility} ${data.unsignedPdfPath} ${data.signImageFile} ${data.tempSignedPdfPath} ${data.nameToShowOnStamp} "${requestData.location}" "${requestData.reason}" ` + data.signFieldData + ` ${data.pfxPath} ${data.pfxPass}`
    }

    if (signType == SignTypes.ESIGN_REQUEST) {
        signingRequest = `java -jar ${javaAadhaarUtility} 1 "" ${data.unsignedPdfPath} ${ASP_ID} 1 ${convertToString(responseUrl)} ${pfxKey} ${pfxFilePass} ${data.signImageFile} 15 1 "${requestData.name}" "${requestData.location}" "${requestData.reason}" "" "" ${data.fieldDataFilePath}`
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