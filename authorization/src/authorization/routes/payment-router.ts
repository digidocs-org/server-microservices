import { bodyValidators, currentUser, headerValidators, queryValidators, validateRequest } from '@digidocs/guardian';
import { Router } from 'express';
import { createOrder, getOrderDetails, indexOrders, paymentCallback } from 'authorization-service/controllers/payment-orders';

const router = Router();

/**
* @Route  GET 'api/v1/authorization/orders/details/:orderId'
* @Desc   Get order detail
* @Access Private
*/
router.get(
    '/details/:orderId',
    headerValidators('token'),
    validateRequest,
    currentUser,
    getOrderDetails
);

/**
* @Route  GET 'api/v1/authorization/orders/index'
* @Desc   Get all orders
* @Access Private
*/
router.get(
    '/index',
    headerValidators('token'),
    validateRequest,
    currentUser,
    indexOrders
);

/**
* @Route  GET 'api/v1/authorization/orders/index'
* @Desc   Get all orders
* @Access Private
*/
router.get(
    '/payment/request',
    queryValidators('token', 'aadhaarCredits', 'digitalCredits', 'redirectUrl'),
    validateRequest,
    currentUser,
    createOrder
);

/**
* @Route  GET 'api/v1/authorization/orders/payment/callback'
* @Desc   Get all orders
* @Access Private
*/
router.get(
    '/payment/callback',
    queryValidators('data','token'),
    validateRequest,
    currentUser,
    paymentCallback
);


export = router;