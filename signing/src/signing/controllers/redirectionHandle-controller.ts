import { Request, Response } from 'express'
import { EsignResponse } from 'signing-service/types'
import { BadRequestError } from '@digidocs/guardian'

export const redirectionHandler = (req: Request, res: Response) => {
    const type = req.query.type as string

    if (!type) {
        throw new BadRequestError("some error occured!!!")
    }

    if (type.toUpperCase() == EsignResponse.SUCCESS) {
        return res.send({ sucess: true, msg: "document signed successfully!!!" })
    }

    if (type.toUpperCase() == EsignResponse.FAILED) {
        throw new BadRequestError("document signing failed!!!")
    }

    if (type.toUpperCase() == EsignResponse.CANCELLED) {
        throw new BadRequestError("signing cancelled!!!")
    }

    throw new BadRequestError("some error occured!!!")
}