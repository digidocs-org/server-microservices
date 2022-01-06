import { BadRequestError, CreditUpdateType, SignTypes } from '@digidocs/guardian';
import DocumentUserMap, { IDocumentUserMap } from 'authorization-service/models/DocumentUserMap';
import { IDocument } from 'authorization-service/models/Document';
import User, { IUser } from 'authorization-service/models/User';
import { IDocumentActions } from 'authorization-service/models/Actions';
import { ActionType } from 'authorization-service/types';
import { CreditUpdatePublisher } from 'src/events/publishers/credit-update-publisher';
import { natsWrapper } from 'src/nats-wrapper';

const updateDocumentCredit = async (document: IDocument) => {
    try {

        let signUserCount = 0

        const documentUserMap = await DocumentUserMap.find({
            document: document.documentId
        }).populate("actions")
        documentUserMap.map((map: IDocumentUserMap) => {
            const action = map.action as IDocumentActions;
            if (action.type == ActionType.SIGN) signUserCount++
        })
        
        const owner = await User.findById(document.userId) as IUser
        if (document.signType == SignTypes.AADHAR_SIGN) {
            owner.aadhaarCredits = owner.aadhaarCredits - signUserCount
            document.reservedAadhaarCredit += signUserCount
            new CreditUpdatePublisher(natsWrapper.client).publish({
                userId: document.userId,
                data: { aadhaarCredits: signUserCount },
                type: CreditUpdateType.DECREASE
            })
        } else {
            owner.digitalSignCredits = owner.digitalSignCredits - signUserCount
            document.reservedAadhaarCredit += signUserCount
            new CreditUpdatePublisher(natsWrapper.client).publish({
                userId: document.userId,
                data: { digitalSignCredits: signUserCount },
                type: CreditUpdateType.DECREASE
            })
        }
    } catch (err) {
        console.log(err);
        throw new BadRequestError("Some error occured");
    }
};

export default updateDocumentCredit;
