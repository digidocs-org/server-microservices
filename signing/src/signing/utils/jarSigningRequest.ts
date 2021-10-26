import { convertToString, SignTypes } from "@digidocs/guardian"
import { EsignRequest, Files } from 'signing-service/types'
import { v4 as uuidv4 } from 'uuid'

export const createJarSigningReq = (rootDir: string, signType: string, requestData: EsignRequest) => {
    const tempFileName = uuidv4();
    const unsignedFilePath = `${rootDir}/temp-${tempFileName}/unsigned.pdf`;
    const responseTextFile = signType == SignTypes.AADHAR_SIGN ? `${rootDir}/temp-${tempFileName}/response.txt` : "";
    const signedFilePath = `${rootDir}/temp-${tempFileName}/signed.pdf`;
    const signImageFilePath = `${rootDir}/sign.jpeg`;
    const unsignedFieldPath = `${rootDir}/temp-${tempFileName}/signedField.pdf`


    const data = {
        esignResponse: convertToString(responseTextFile),
        unsignedPdfPath: convertToString(unsignedFilePath),
        tempSignedPdfPath: convertToString(signedFilePath),
        signImageFile: convertToString(signImageFilePath),
        nameToShowOnStamp: convertToString("Naman Singh"),
        locationToShowOnStamp: convertToString("India"),
        reasonToShowOnStamp: convertToString("Aadhar E-signature"),
        unsignedFieldPath: convertToString(unsignedFieldPath),
        signType: convertToString(signType),
        date: convertToString(requestData.timeOfDocSign),
        docId: convertToString(requestData.docId.toString()),
        pfxPath: convertToString(Files.pfxKey),
        pfxPass: convertToString(process.env.PFX_FILE_PASS!),
        signFieldData: JSON.stringify(convertToString(requestData.signatureFieldData))
    }

    const signingRequest = `java -jar ${Files.javaUtility} ${data.signType} ${data.esignResponse} ${data.unsignedPdfPath} ${data.signImageFile} ${data.tempSignedPdfPath} "${requestData.name}" "${requestData.location}" "${requestData.reason}" ${data.date} ${data.docId} ${data.signFieldData} ${data.pfxPath} ${data.pfxPass} ${data.unsignedFieldPath}`

    return {
        unsignedFilePath,
        responseTextFile,
        signedFilePath,
        unsignedFieldPath,
        signingRequest
    }
}