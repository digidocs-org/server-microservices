import { Router } from 'express';
import {
  bodyValidators,
  headerValidators,
  validateRequest,
} from '@digidocs/guardian';

const router = Router();

router.get('/', headerValidators('token'), validateRequest);

export default router;
