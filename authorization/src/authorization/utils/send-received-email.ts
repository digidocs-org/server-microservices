import { IDocument } from 'authorization-service/models/Document';
import { IDocumentUserMap } from 'authorization-service/models/DocumentUserMap';
import { IUser } from 'authorization-service/models/User';
import { SendEmailPublisher } from 'src/events/publishers/send-email-publisher';
import { natsWrapper } from 'src/nats-wrapper';
import { generateEncryptedToken } from './generate-recipient-token';

export const sendReceivedEmail = (docUserMap: IDocumentUserMap) => {
  const user = docUserMap.user as IUser;
  const document = docUserMap.document as IDocument;
  const token = generateEncryptedToken(user.id);

  const deeplink = `${process.env.DOCUMENT_ACCESS_URL}/${document.id}?token=${token}`;
  new SendEmailPublisher(natsWrapper.client).publish({
    senderEmail: 'notifications@digidocs.one',
    clientEmail: user.email,
    subject: 'Document Received',
    body: `You have received the document. Please click on the link to view the document. ${deeplink}`,
  });
};
