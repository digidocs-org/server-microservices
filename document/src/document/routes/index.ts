import {
  headerValidators,
  bodyValidators,
  validateRequest,
  currentUser,
} from '@digidocs/guardian';
import {Router} from 'express';
import {body} from 'express-validator';
import {
  createDocument,
  deleteDocument,
  downloadDocument,
  indexDocument,
  sendDocument,
} from 'document-service/controllers';
import {hasDocumentAccess} from 'document-service/middlewares/documentAccess';

export class DocumentRouter {
  private static router = Router();

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
      '/api/document',
      headerValidators('token'),
      validateRequest,
      currentUser,
      indexDocument
    );

    /**
     * @Route  GET 'api/v1/document/:id'
     * @Desc   delete specific document
     * @Access Private
     */
    this.router.delete(
      '/api/document/:id',
      headerValidators('token'),
      currentUser,
      hasDocumentAccess,
      deleteDocument
    );

    return this.router;
  }
}
