import { headerValidators, bodyValidators, validateRequest, currentUser } from '@digidocs/guardian'
import { Router } from 'express';
import { aadharEsignRequest, esignCallback } from 'signing-service/controllers';
import { redirectionHandler } from 'signing-service/controllers/redirectionHandle-controller';

export class SigningRouter {
    private static router = Router()

    public static route() {

        /**
        * @Route  GET 'api/v1/sign/aadhar-esign'
        * @Desc   create a esign request to NSDL
        * @Access Private
        */
        this.router.get(
            '/api/esign/aadhar/request/:id',
            headerValidators('token'),
            validateRequest,
            currentUser,
            aadharEsignRequest
        );


        /**
         * @Route  POST 'api/v1/sign/aadhar-esign/callback'
         * @Desc   Callback route for signing document
         * @Access Private
         */
        this.router.post(
            '/api/esign/aadhar/callback',
            esignCallback
        );

        /**
         * @Route  POST 'api/v1/sign/aadhar-esign/redirect'
         * @Desc   redirect route for validating signing
         * @Access Private
         */
        this.router.get(
            '/api/esign/aadhar/redirect',
            redirectionHandler
        )

        return this.router
    }
}