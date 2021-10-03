export const endpoints = {
    DOCUMENT_ROUTES: {
        index: '/api/document/index',
        createDocument: '/api/document/create',
        downloadDocument: '/api/document/download',
    },
    SIGNING_ROUTES: {
        aadharEsignRequest: '/api/esign/aadhar/request',
        aadharEsignCallback: '/api/esign/aadhar/callback',
        redirectCallback: '/api/esign/aadhar/redirect',
        digitalSignRequest: '/api/esign/digital',
    }
}