import { headerValidators, bodyValidators, validateRequest, currentUser } from '@digidocs/guardian'
import { Router } from 'express';
import { aadharEsignRequest, esignCallback } from 'signing-service/controllers';
import { redirectionHandler } from 'signing-service/controllers/redirectionHandle-controller';
import {digitalSignRequest} from 'signing-service/controllers/digital-esign-controller'

export class SigningRouter {
    private static router = Router()

    public static route() {

        /**
        * @Route  GET 'api/v1/sign/aadhar-esign'
        * @Desc   create a esign request to NSDL
        * @Access Private
        */
        this.router.post(
            '/api/esign/aadhar/request',
            bodyValidators("documentId"),
            // headerValidators('token'),
            validateRequest,
            // currentUser,
            aadharEsignRequest
        );


        /**
         * @Route  POST 'api/v1/sign/aadhar-esign/callback'
         * @Desc   Callback route for signing document
         * @Access Private
         */
        this.router.post(
            '/api/esign/aadhar/callback',
            bodyValidators("espResponse"),
            validateRequest,
            esignCallback
        );

        /**
         * @Route  POST 'api/v1/sign/aadhar-esign/redirect'
         * @Desc   redirect route for validating signing
         * @Access Private
         */
        this.router.post(
            '/api/esign/aadhar/redirect',
            bodyValidators("resType"),
            validateRequest,
            redirectionHandler
        )

        /**
         * @Route  POST 'api/v1/sign/aadhar-esign/redirect'
         * @Desc   redirect route for validating signing
         * @Access Private
         */
         this.router.post(
            '/api/esign/digital',
            bodyValidators("documentId"),
            validateRequest,
            digitalSignRequest
        )

        return this.router
    }
}