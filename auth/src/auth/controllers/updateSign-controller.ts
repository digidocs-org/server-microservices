import { BadRequestError, checkForBuffer, uploadToS3Bucket } from '@digidocs/guardian'
import { Request, Response } from 'express'
import User from 'auth/models'
import { UserUpdatedPublisher } from 'src/events/publishers'
import { natsWrapper } from 'src/nats-wrapper'

export const updateSign = async (req: Request, res: Response) => {
    const userId = req.currentUser?.id

    const user = await User.findById(userId)
    if (!user) {
        throw new BadRequestError("User not found")
    }

    if (!req.files && !req.body.file) {
        throw new BadRequestError("no file provided")
    }

    const signFile = req.files ? req.files.file : req.body.file
    if (signFile.mimetype != 'image/png') {
        throw new BadRequestError("upload a valid png file")
    }

    signFile.data = checkForBuffer(signFile.data) ? signFile.data : Buffer.from(signFile.data, "base64")

    const parseUploadData = {
        mime: 'image/png',
        data: signFile.data,
        length: signFile.data.length,
        name: 'signature.png',
        key: `${userId}/documents/signature.png`,
        contentEncoding: 'base64'
    }

    const data = await uploadToS3Bucket(parseUploadData)
    const url = `${process.env.CLOUDFRONT_URI}/${data.key}`

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