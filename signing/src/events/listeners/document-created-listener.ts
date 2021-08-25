import { Subjects, Listener, CreateDocumentEvent } from '@digidocs/guardian';
import { queueGroupName } from 'signing-service/types'
import { Message } from 'node-nats-streaming';
import Document from 'signing-service/models/document'

export class CreateUserListener extends Listener<CreateDocumentEvent>{
    subject: Subjects.CreateDocument = Subjects.CreateDocument;
    queueGroupName = queueGroupName;

    async onMessage(data: CreateDocumentEvent['data'], msg: Message) {
        try {
            const document = Document.create({
                _id: data.id,
                name: data.name,
                message: data.message,
                inOrder: data.inOrder,
                publicKeyId: data.publicKeyId,
                documentId: data.documentId,
                selfSign: data.selfSign,
                isDrafts: data.isDrafts,
                status: data.status,
                userId: data.userId,
                validTill: data.validTill,
                timeToSign: data.timeToSign,
                version: data.version,
            })
            msg.ack()
        } catch (error) {
            console.log(error)
            msg.ack()
        }
    }
}