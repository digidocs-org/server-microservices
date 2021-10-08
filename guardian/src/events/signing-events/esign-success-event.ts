import { SignTypes } from '../../types';
import { Subjects } from '../subjects';

export interface CreateDocumentEvent {
    subject: Subjects.SigningSuccess;
    data: {
        type: SignTypes
    };
}