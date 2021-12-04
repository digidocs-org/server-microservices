import { BadRequestError } from '@digidocs/guardian'
import { Request, Response } from 'express'

export const paymentCallback = (req: Request, res: Response) => {
    const { data } = req.query
    const parsedData = JSON.parse(decodeURIComponent(data as string))
    res.send(parsedData)
}