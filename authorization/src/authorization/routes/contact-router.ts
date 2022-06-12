import { Router } from 'express';
import { contactUs } from 'authorization-service/controllers/contact'

const router = Router();

router.post(
    '/',
    contactUs
);



export = router;
