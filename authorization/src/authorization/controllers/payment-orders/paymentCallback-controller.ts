import { Request, Response } from 'express'

export const paymentCallback = (req: Request, res: Response) => {
    console.log(req.body)
    res.send({ success: "failed" })
}