import { Request, Response } from 'express'
import Actions, { IActionFields } from 'authorization-service/models/Actions'
import DocumentUserMap from 'authorization-service/models/DocumentUserMap'
import Document from 'authorization-service/models/Document'
import { BadRequestError, DocumentStatus } from '@digidocs/guardian'
import User from 'authorization-service/models/User'

export const addFields = async (req: Request, res: Response) => {
    const userId = req.currentUser?.id
    const fieldData = req.body.fieldData
    const userEmail = req.body.userEmail
    const documentId = req.params.documentId

    const user = await User.findOne({ email: userEmail })
    if (!user) {
        throw new BadRequestError(`Cannot find user with email ${userEmail}`)
    }

    const document = await Document.findById(documentId)
    if (!document) {
        throw new BadRequestError("Cannot find document")
    }
    if(document.status == DocumentStatus.PENDING){
        throw new BadRequestError("Cannot update field as document status is pending")
    }

    const documentUserMap = await DocumentUserMap.findOne({ user: user.id, document: documentId })
    if (!documentUserMap || document.userId != userId) {
        throw new BadRequestError("Cannot add field")
    }

    const action = await Actions.findById(documentUserMap.action)
    if (!action) {
        throw new BadRequestError("Cannot add field, action not found")
    }

    let newActionFields: any[] = []
    fieldData.map((data: IActionFields) => {
        newActionFields.push({
            dataX: data.dataX ?? '',
            dataY: data.dataY ?? '',
            height: data.height ?? '',
            width: data.width ?? '',
            pageNumber: data.pageNumber ?? '',
            recipientName: data.recipientName ?? '',
            recipientEmail: data.recipientEmail ?? '',
            dragTypeID: data.dragTypeID ?? ''
        })
    })
    action.fields = newActionFields
    await action.save()
    res.send({ success: true, msg: "fields added successfully" })
}