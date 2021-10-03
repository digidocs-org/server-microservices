import { Router } from 'express';
import {
    bodyValidators,
    currentUser,
    headerValidators,
    validateRequest,
} from '@digidocs/guardian';
import hasDocumentAccess from 'authorization-service/middlewares/has-document-access';
import { addRecipientsController } from 'authorization-service/controllers/recipient';


const router = Router();

/**
 * @Route  GET '/api/v1/document/add-recipients'
 * @Desc   Add Recipients of the document
 * @Access Public
 */
router.post(
    '/api/v1/document/add-recipients',
    headerValidators('token', 'documentId'),
    validateRequest,
    currentUser,
    hasDocumentAccess,
    addRecipientsController
);

export = router