// /* eslint-disable eqeqeq */
// import documentUserModel, { IDocumentUserMap } from 'document-service/models/document-user';
// import { Request, Response, NextFunction } from 'express';
// import { BadRequestError, DocumentStatus } from '@digidocs/guardian';
// import { IDocument } from 'signing-service/models';


// declare global {
//     // eslint-disable-next-line @typescript-eslint/no-namespace
//     namespace Express {
//         interface Request {
//             documentUserMap: IDocumentUserMap
//         }
//     }
// }

// const hasDocumentAccess = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     const userId = req.currentUser?.id;
//     const documentId = req.params.id;

//     const documentUserMap = await documentUserModel
//         .findOne({
//             user: userId,
//             document: documentId,
//         })
//         .populate('document')
//         .populate('actions');

//     if (!documentUserMap || !documentUserMap.access) {
//         throw new BadRequestError(
//             'Document not found or user is not authorized to acccess the document!'
//         );
//     }

//     const document = documentUserMap.document as IDocument;

//     if (
//         document.userId != userId &&
//         (document.status === DocumentStatus.CANCELLED ||
//             document.status === DocumentStatus.VOIDED)
//     ) {
//         throw new BadRequestError('Document is either cancelled or voided!');
//     }
//     req.documentUserMap = documentUserMap;

//     next();
// };

// export { hasDocumentAccess };
