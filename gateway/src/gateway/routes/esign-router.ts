import { bodyValidators, headerValidators, validateRequest } from '@digidocs/guardian';
import { Router } from 'express';
import { aadharEsignCallback, aadharEsignRequest, redirectCallback } from 'gateway/controllers/esign-controller';

const router = Router();

/**
        * @Route  GET 'api/v1/sign/aadhar-esign'
        * @Desc   create a esign request to NSDL
        * @Access Private
        */
router.get(
    '/api/esign/aadhar/request/:id',
    // headerValidators('token'),
    // validateRequest,
    // currentUser,
    aadharEsignRequest
);


/**
 * @Route  POST 'api/v1/sign/aadhar-esign/callback'
 * @Desc   Callback route for signing document
 * @Access Private
 */
router.post(
    '/api/esign/aadhar/callback',
    bodyValidators("msg"),
    aadharEsignCallback
);

/**
 * @Route  POST 'api/v1/sign/aadhar-esign/redirect'
 * @Desc   redirect route for validating signing
 * @Access Private
 */
router.get(
    '/api/esign/aadhar/redirect',
    redirectCallback
)

/**
 * @Route  POST 'api/v1/sign/aadhar-esign/redirect'
 * @Desc   redirect route for validating signing
 * @Access Private
 */
router.post(
    '/api/esign/digital/:id',
    digitalSignRequest
)

export = router;
