import { Publisher, Subjects, EsignSuccessEvent } from '@digidocs/guardian'

export class EsignSuccess extends Publisher<EsignSuccessEvent> {
    subject: Subjects.SigningSuccess = Subjects.SigningSuccess;
}
