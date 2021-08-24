import { Request, Response } from 'express';
import { BadRequestError, deleteFromS3 } from '@digidocs/guardian';
import DocumentModel, { IDocument } from 'document-service/models/document';
import DocumentUserModel from 'document-service/models/document-user';
import ActionModel from 'document-service/models/actions';

export const deleteDocument = async (req: Request, res: Response) => {
    const userId = req.currentUser?.id;
    const {
        _id: id,
        documentId,
        publicKeyId,
        isDrafts,
        userId: ownerId,
    } = req.documentUserMap?.document as IDocument;

    if (userId != ownerId) {
        throw new BadRequestError('Only owner can delete the document!!');
    }

    if (!isDrafts) {
        throw new BadRequestError('Cannot Delete document!!');
    }

    let documentUserMaps = await DocumentUserModel.find({ document: id });

    const documentKey = `${userId}/documents/${documentId}`;
    const publicKey = `${userId}/keys/${publicKeyId}`;

    try {
        deleteFromS3(documentKey);
        deleteFromS3(publicKey);

        const documentUserMapIds = documentUserMaps.map((map) => map.id);
        documentUserMaps = documentUserMaps.filter((map) => map.action);
        const actionIds = documentUserMaps.map((map) => map.action?.toString());

        await ActionModel.deleteMany({ _id: { $in: actionIds } });
        await DocumentUserModel.deleteMany({ _id: { $in: documentUserMapIds } });
        await DocumentModel.deleteOne({ _id: id });

        return res.send({ success: true });
    } catch (err) {
        throw new BadRequestError('Cannot Delete document!!');
    }
};
