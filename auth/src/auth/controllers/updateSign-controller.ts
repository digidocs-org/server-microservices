import { BadRequestError, uploadToS3Bucket } from '@digidocs/guardian'
import { Request, Response } from 'express'
import { UploadedFile } from 'express-fileupload'
import User from 'auth/models'
import { UserUpdatedPublisher } from 'src/events/publishers'
import { natsWrapper } from 'src/nats-wrapper'

export const updateSign = async (req: Request, res: Response) => {
    const userId = req.currentUser?.id

    const user = await User.findById(userId)
    if (!user) {
        throw new BadRequestError("User not found")
    }

    if (!req.files) {
        throw new BadRequestError("no file provided")
    }

    const signFile = req.files.file as UploadedFile
    if (signFile.mimetype != 'image/png') {
        throw new BadRequestError("upload a valid png file")
    }

    const parseUploadData = {
        mime: 'image/png',
        data: signFile.data,
        length: signFile.data.length,
        name: 'signature.png',
        key: `${userId}/documents/signature.png`,
    }

    const data = await uploadToS3Bucket(parseUploadData)
    const url = `${process.env.S3_BUCKET_BASE_URL}/${data.key}`

    user.signUrl = url
    await user.save()

    new UserUpdatedPublisher(natsWrapper.client).publish({
        id: user._id,
        signUrl: url
    })

    res.send({
        success: true, data: { name: data.name, url }
    })
}