import { Request, Response } from 'express';
import { DocumentStatus, BadRequestError } from '@digidocs/guardian';
import { IDocument } from 'document-service/models';
// import { scheduleSendDocument } from '../../services/scheduling/sendDocument';
import { DocumentService } from 'document-service/services';

export const sendDocument = async (req: Request, res: Response) => {
    const document = req.documentUserMap?.document as IDocument;
    const documentId = document.id.toString();

    if (!document.isDrafts) {
        throw new BadRequestError('Cannot send document!');
    }

    /**
     * This is a premium feature and will be made live after the creation of queueing service
     */
    // if (req.body.scheduleSend && req.body.time) {
    //     const delay = new Date(+req.body.time).getTime() - new Date().getTime();
    //     if (delay < 0) throw new BadRequestError('time should be in future!!!');
    //     scheduleSendDocument.add(
    //         {
    //             documentId,
    //         },
    //         {
    //             delay,
    //         }
    //     );
    //     document.isDrafts = false;
    //     document.status = DocumentStatus.PENDING;
    //     await document.save();
    //     return res.send({ success: true });
    // }

    // Send the document to other users for signing.
    await DocumentService.sendDocument(documentId);
    document.isDrafts = false;
    document.status = DocumentStatus.PENDING;
    await document.save();
    res.send({ success: true });
};
