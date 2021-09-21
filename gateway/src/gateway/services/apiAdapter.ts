import Axios, { AxiosError } from 'axios';
import { Response } from 'express'

export const apiAdapter = (baseURL: string) => {
    return Axios.create({
        baseURL
    })
}

export const errorResponseParser = (error: any, res: Response) => {
    if (error.response) {
        const { data, status } = error.response
        return res.status(status).send(data)
    }
    return res.send(500).send("Something went wrong")
}