import { xml2json } from '@digidocs-org/rsa-crypt'
import {EsignResponse } from 'signing-service/types'

export const verifyEsignResponse = (xmlResponse: string) => {
    const json = JSON.parse(xml2json(xmlResponse))
    const errCode = json?.EsignResp?._attributes?.errCode
    const errMsg = json?.EsignResp?._attributes?.errMsg

    if (errCode == "ESP-944") {
        return { code: errCode, msg: errMsg, actionType: EsignResponse.CANCELLED }
    }

    return { code: 200, msg: "success", actionType: EsignResponse.SUCCESS }
}