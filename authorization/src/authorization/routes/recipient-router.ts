import { Router } from 'express';
import { currentUser } from '@digidocs/guardian';
import hasDocumentAccess from 'authorization-service/middlewares/has-document-access';
import { addRecipientsController } from 'authorization-service/controllers/recipient';

const router = Router();

/**
 * @Route  GET '/api/v1/document/add-recipients'
 * @Desc   Add Recipients of the document
 * @Access Public
 */
router.post(
  '/add-recipients/:documentId',
  // headerValidators('token'),
  // validateRequest,
  currentUser,
  hasDocumentAccess,
  addRecipientsController
);

export = router;
