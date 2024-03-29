export const endpoints = {
  DOCUMENT_ROUTES: {
    index: '/api/document/index',
    createDocument: '/api/document/create',
    downloadDocument: '/api/document/download',
    updateDocument: '/api/document/update',
  },
  SIGNING_ROUTES: {
    aadharEsignRequest: '/api/esign/aadhar/request',
    aadharEsignCallback: '/api/esign/aadhar/callback',
    redirectCallback: '/api/esign/aadhar/redirect',
    digitalSignRequest: '/api/esign/digital',
  },
  PAYMENT_ROUTES: {
    getOrderDetail: '/orders/detail',
    indexOrders: '/orders/index',
    createOrder: '/orders/payment/request'
  }
};
