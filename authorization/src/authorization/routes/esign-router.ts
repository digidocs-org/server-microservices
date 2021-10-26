import { bodyValidators, headerValidators, validateRequest } from '@digidocs/guardian';
import { Router } from 'express';
import { aadharEsignCallback, aadharEsignRequest, digitalSignRequest, redirectCallback } from 'authorization-service/controllers/signing';

const router = Router();

/**
* @Route  GET 'api/v1/sign/aadhar-esign'
* @Desc   create a esign request to NSDL
* @Access Private
*/
router.get(
    '/aadhar/request/:id',
    aadharEsignRequest
);


/**
 * @Route  POST 'api/v1/sign/aadhar-esign/callback'
 * @Desc   Callback route for signing document
 * @Access Private
 */
router.post(
    '/aadhar/callback',
    bodyValidators("msg"),
    aadharEsignCallback
);

/**
 * @Route  POST 'api/v1/sign/aadhar-esign/redirect'
 * @Desc   redirect route for validating signing
 * @Access Private
 */
router.get(
    '/aadhar/redirect',
    redirectCallback
)

/**
 * @Route  POST 'api/v1/sign/aadhar-esign/redirect'
 * @Desc   redirect route for validating signing
 * @Access Private
 */
router.get(
    '/digital/request/:id',
    headerValidators("token"),
    validateRequest,
    digitalSignRequest
)

export = router;
