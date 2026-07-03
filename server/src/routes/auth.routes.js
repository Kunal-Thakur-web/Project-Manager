import Router from "express";
import {registerUser,login,logout,getCurrentUser,verifyEmail,resendEmailVerification,refreshAccessToken,forgotPassword,resetForgotPassword,resetCurrentPassword} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator, logginValidator,resetCurrPassValidator,resetForgotPassValidator,forgotPassValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//unsecure routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(logginValidator(), validate ,login);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post (forgotPassValidator(), validate, forgotPassword);
router.route("/reset-password/:resetToken").post(resetForgotPassValidator(), validate, resetForgotPassword);



//secure routes
router.route("/logout").post(verifyJWT ,logout);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification);
router.route("/change-password").post(verifyJWT, resetCurrPassValidator() ,validate, resetCurrentPassword);


export default router;