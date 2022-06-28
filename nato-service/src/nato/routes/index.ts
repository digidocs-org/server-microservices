import { Router } from 'express';
import UrlShortenerServiceRouter from './url-shortener-service-route'

export class NatoRouter {
    private static router = Router()

    public static route() {
        /** 
         * @desc url shortener route acting as a downstream
        */
        this.router.use('api/v1/nato/shortener', UrlShortenerServiceRouter)
        return this.router;
    }
}