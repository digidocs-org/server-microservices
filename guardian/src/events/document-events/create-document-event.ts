import { DocumentStatus } from '../../types';
import { Subjects } from '../subjects';

export interface CreateDocument {
    subject: Subjects.CreateDocument;
    data: {
        name: string
        message?: string
        inOrder?: boolean
        publicKeyId: string
        documentId: string
        selfSign?: boolean
        isDrafts?: boolean
        status?: DocumentStatus
        userId: string
        validTill?: string
        timeToSign?: string
        version: number
    };
}