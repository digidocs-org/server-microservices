import { Router } from 'express';
import { contactUs } from 'authorization-service/controllers/contact'
import { bodyValidators, validateRequest } from '@digidocs/guardian';

const router = Router();

router.post(
    '/',
    bodyValidators("userName", "userEmail", "userQuery", "subject"),
    validateRequest,
    contactUs
);

export = router;
