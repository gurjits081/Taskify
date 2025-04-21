import { Router } from 'express';
import { userRegisterValidator, userLoginValidator } from '../validators/index.js';
import { validate } from '../middlewares/validator.middleware.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  resendEmailVerification,
} from '../controllers/auth.controller.js';
import { isLoggedIn } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(userRegisterValidator(), validate, registerUser);
router.route('/login').post(userLoginValidator(), validate, loginUser);
router.route('/logout').post(isLoggedIn, logoutUser);
router.route('/verify/:token').post(verifyEmail);
router.route('/resend-email-verification').post(isLoggedIn, resendEmailVerification);

export default router;
