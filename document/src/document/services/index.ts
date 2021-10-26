import { BadRequestError, IEmailOptions } from '@digidocs/guardian';
import { IUser } from 'document-service/models';
import Document from 'document-service/models/document';
import DocumentUserModel from 'document-service/models/document-user';
import { sendEmailToClient } from './sendEmailToClient'

export class DocumentService {
    static async sendDocument(documentId: string) {
        const document = await Document.findById(documentId);

        if (!document) {
            throw new BadRequestError('Cannot send document!');
        }

        const receivers = await DocumentUserModel.find({
            document: documentId,
        }).populate('user');

        for (const receiver of receivers) {
            const user = receiver.user as IUser;

            const options: IEmailOptions = {
                senderEmail: "notifications@digidocs.one",
                clientEmail: user.email,
                subject: 'Received a document',
                body: 'You have received a document. Please login to your digidocs account to access the document.',
            };

            if (document.inOrder && !receiver.access) {
                receiver.access = true;
                await receiver.save();
                sendEmailToClient(options);
                break;
            } else if (!receiver.access) {
                receiver.access = true;
                await receiver.save();
                sendEmailToClient(options);
            }
        }

        return { sucess: true };
    }
}