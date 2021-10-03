import { Router } from 'express';
import { createDocumentController, downloadDocumentController, indexDocumentController, sendDocumentController } from 'authorization-service/controllers/document';
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
    '/',
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
    '/download',
    headerValidators('token'),
    bodyValidators('documentId'),
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
    bodyValidators('documentId'),
    validateRequest,
    currentUser,
    hasDocumentAccess,
    indexDocumentController
);

/**
 * @Route  GET '/api/v1/document/send'
 * @Desc   Send Document to the recipients
 * @Access Public
 */
router.post(
    '/send',
    headerValidators('token'),
    bodyValidators('documentId'),
    validateRequest,
    currentUser,
    hasDocumentAccess,
    sendDocumentController
);

export = router