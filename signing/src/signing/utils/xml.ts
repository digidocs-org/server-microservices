interface XMLData {
    aspId: string
    responseUrl: string
    checksum: string
}

export const generateXml = (data: XMLData) => {
    const { aspId, responseUrl, checksum } = data
    const timeStamp = new Date().toISOString()
    const txnId = `DCS:eSign:${new Date().getTime()}`

    return `<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>` +
        `<Esign AuthMode=\"1\" aspId=\"${aspId}\" ekycId=\"\" ekycIdType=\"A\" responseSigType=\"pkcs7\" responseUrl=\"${responseUrl}\" sc=\"Y\" ts=\"${timeStamp}\" txn=\"${txnId}\" ver=\"2.1\">` +
        `<Docs><InputHash docInfo=\"Document for eSign\" hashAlgorithm=\"SHA256\" id=\"1\">${checksum}</InputHash></Docs>` +
        `</Esign>`
}