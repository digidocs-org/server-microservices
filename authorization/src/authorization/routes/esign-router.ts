import {
  bodyValidators,
  currentUser,
  validateRequest,
} from '@digidocs/guardian';
import { Router } from 'express';
import {
  aadharEsignCallback,
  aadharEsignRequest,
  digitalSignRequest,
} from 'authorization-service/controllers/signing';
import hasDocumentAccess from 'authorization-service/middlewares/has-document-access';

const router = Router();

/**
 * @Route  GET 'api/v1/sign/aadhar-esign'
 * @Desc   create a esign request to NSDL
 * @Access Private
 */
router.post(
  '/aadhar/request/:documentId',
  // bodyValidators("token"),
  bodyValidators('redirect_uri'),
  validateRequest,
  currentUser,
  hasDocumentAccess,
  aadharEsignRequest
);

/**
 * @Route  POST 'api/v1/sign/aadhar-esign/callback'
 * @Desc   Callback route for signing document
 * @Access Private
 */
router.post(
  '/aadhar/callback',
  bodyValidators('msg'),
  validateRequest,
  aadharEsignCallback
);

/**
 * @Route  POST 'api/v1/sign/aadhar-esign/redirect'
 * @Desc   redirect route for validating signing
 * @Access Private
 */
router.post(
  '/digital/request/:documentId',
  // headerValidators('token'),
  // validateRequest,
  currentUser,
  hasDocumentAccess,
  digitalSignRequest
);

export = router;
