import { headerValidators, bodyValidators, validateRequest, currentUser } from '@digidocs/guardian'
import { Router } from 'express';
import { body } from 'express-validator';
import { createDocument } from 'document-service/controllers'

export class AuthRouter {
    private static router = Router()

    public static route() {
        /**
         * @Route  POST 'api/v1/document/create'
         * @Desc   Create a document
         * @Access Public
         */
        this.router.post(
            '/api/document/create',
            headerValidators('token'),
            validateRequest,
            currentUser,
            createDocument
        );

        /**
         * @Route  POST 'api/v1/document/:id/update'
         * @Desc   Update a document
         * @Access Public
         */
        this.router.post(
            '/api/document/:id/update-fields',
            headerValidators('token'),
            bodyValidators('actions'),
            body('actions').isArray().withMessage('actions should be an array!!!'),
            validateRequest,
            currentUser,
            updateFields
        );

        /**
         * @Route  POST 'api/v1/document/:id/send'
         * @Desc   Update a document
         * @Access Public
         */
        this.router.post(
            '/api/document/:id/send',
            headerValidators('token'),
            validateRequest,
            currentUser,
            hasDocumentAccess,
            sendDocument
        );

        /**
         * @Route  GET 'api/v1/document/:id/download'
         * @Desc   download a document
         * @Access Public
         */
        this.router.get(
            '/api/document/:id/download',
            headerValidators('token'),
            validateRequest,
            currentUser,
            hasDocumentAccess,
            downloadDocument
        );

        /**
         * @Route  GET 'api/v1/document/index'
         * @Desc   index all the documents
         * @Access Public
         */
        this.router.get(
            '/api/document/index',
            headerValidators('token'),
            validateRequest,
            currentUser,
            indexDocument
        );

        this.router.post(
            '/api/document/:id/add-recipients',
            headerValidators('token'),
            validateRequest,
            currentUser,
            hasDocumentAccess,
            addRecipient
        );

        this.router.delete(
            '/api/document/:id',
            headerValidators('token'),
            currentUser,
            hasDocumentAccess,
            deleteDocument
        );

        this.router.get(
            '/api/document/:id/detail',
            headerValidators('token'),
            currentUser,
            hasDocumentAccess,
            documentDetail
        );
    }
}