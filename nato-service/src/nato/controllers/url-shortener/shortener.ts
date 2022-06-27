import { BadRequestError } from '@digidocs/guardian';
import { Request, Response } from 'express';
import validUrl from 'valid-url'
import { nanoid } from 'nanoid'
import UrlShortener from 'nato-service/models/UrlShortener';

export const urlShortenerController = async (req: Request, res: Response) => {
    const { longUrl, expireTime } = req.body

    if (!validUrl.isUri(longUrl)) {
        throw new BadRequestError("invalid url")
    }

    const urlCode = nanoid(12)

    try {
        let url = await UrlShortener.findOne({ longUrl })
        if (url) {
            return res.send({
                succes: true,
                found: 1,
                data: url
            })
        }
        const shortUrl = process.env.URL_SHORTENER_BASE_URL + urlCode

        url = await UrlShortener.create({
            longUrl,
            shortUrl,
            urlCode,
            expireTime
        })

        return res.send({
            success: true,
            created: 1,
            data: url
        })
    } catch (error) {
        throw new BadRequestError("url not created!!!")
    }
};
