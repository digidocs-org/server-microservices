import { Router } from 'express';
import {
  urlShortenerController
} from 'nato-service/controllers/url-shortener/shortener';
import {
  bodyValidators,
  currentUser,
  validateRequest,
} from '@digidocs/guardian';

const router = Router();

/**
 * @Route  GET '/api/v1/document'
 * @Desc   Create new document
 * @Access Public
 */
router.post(
  '/create',
  bodyValidators('longUrl'),
  validateRequest,
  urlShortenerController
);

export = router;
