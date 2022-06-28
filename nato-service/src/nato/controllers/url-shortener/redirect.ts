import { BadRequestError } from '@digidocs/guardian';
import { Request, Response } from 'express';
import UrlShortener from 'nato-service/models/UrlShortener';

export const redirectController = async (req: Request, res: Response) => {
    const code = req.params.code

    try {
        const urlData = await UrlShortener.findOne({
            urlCode: code
        })

        if (!urlData) {
            throw new BadRequestError("url not found")
        }

        return res.send({
            success: true,
            data: urlData
        })
    } catch (error) {
        console.log(error)
        throw new BadRequestError("url not found")
    }
};