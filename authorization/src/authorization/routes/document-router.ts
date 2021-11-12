import { Router } from 'express';
import {
  createDocumentController,
  downloadDocumentController,
  indexDocumentController,
  sendDocumentController,
  updateDocumentController,
  documentDetailsController,
} from 'authorization-service/controllers/document';
import {
  bodyValidators,
  currentUser,
  headerValidators,
  validateRequest,
} from '@digidocs/guardian';
import hasDocumentAccess from 'authorization-service/middlewares/has-document-access';

const router = Router();

/**
 * @Route  GET '/api/v1/document'
 * @Desc   Create new document
 * @Access Public
 */
router.post(
  '/create',
  headerValidators('token'),
  validateRequest,
  currentUser,
  createDocumentController
);

/**
 * @Route  GET '/api/v1/document/:id/download'
 * @Desc   Download the document
 * @Access Public
 */
router.get(
  '/download/:documentId',
  headerValidators('token'),
  validateRequest,
  currentUser,
  hasDocumentAccess,
  downloadDocumentController
);

/**
 * @Route  GET '/api/v1/document/index'
 * @Desc   index all the documents
 * @Access Public
 */
router.get(
  '/index',
  headerValidators('token'),
  validateRequest,
  currentUser,
  indexDocumentController
);

/**
 * @Route  GET '/api/v1/document/send'
 * @Desc   Send Document to the recipients
 * @Access Public
 */
router.post(
  '/send/:documentId',
  headerValidators('token'),
  validateRequest,
  currentUser,
  hasDocumentAccess,
  sendDocumentController
);

router.put(
  '/update/:documentId',
  headerValidators('token'),
  validateRequest,
  currentUser,
  hasDocumentAccess,
  updateDocumentController
);

router.get(
  '/details/:documentId',
  headerValidators('token'),
  validateRequest,
  currentUser,
  hasDocumentAccess,
  documentDetailsController
);

export = router;