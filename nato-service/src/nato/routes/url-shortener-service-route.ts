import { Router } from 'express';
import {
  redirectController,
  urlShortenerController
} from 'nato-service/controllers/url-shortener';
import {
  bodyValidators,
  currentUser,
  validateRequest,
} from '@digidocs/guardian';

const router = Router();

/**
 * @Route  GET '/api/v1/nato/shortener/create'
 * @Desc   Create new shortened url
 * @Access Public
 */
router.post(
  '/create',
  bodyValidators('longUrl'),
  validateRequest,
  urlShortenerController
);

/**
 * @Route  GET '/api/v1/nato/shortener/get'
 * @Desc   Create new document
 * @Access Public
 */
router.get(
  '/:code',
  redirectController
);
export = router;
