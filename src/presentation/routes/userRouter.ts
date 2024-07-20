import express from "express";
import { UserRepository } from "../../infrastructure/repository/userRepository";
import { UserUseCase } from "../../application/useCase/userUsecase";
import { userController } from "../controller/userController";
import passport from "passport"
import multer from 'multer';
import adminverifyToken from "../../middleware/jwtVerifyToken";
const router = express.Router();
const upload = multer();
const repository = new UserRepository();
const user = new UserUseCase(repository);
const controller = new userController(user);

router.post("/register", controller.registerUser.bind(controller));
router.get("/logOut", controller.logOut.bind(controller));
router.post("/otp-verification", controller.otpverification.bind(controller));
router.post("/login", controller.loginUser.bind(controller));
router.get("/user-management", passport.authenticate('jwt', { session: false }), adminverifyToken, controller.getAllUsers.bind(controller));router.put("/isBlocked/:userId", controller.isBlocked.bind(controller));
router.get("/getUser/:userId",controller.getUserwithId.bind(controller));
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get("/auth/google/callback",passport.authenticate("google", {failureRedirect: "http://localhost:3000/login",
}),
    controller.handleGooglePassport.bind(controller)
  );
router.post('/roleUpdate',controller.roleUpdate.bind(controller));
router.post('/refresh-token',controller.refreshTokens.bind(controller));
router.get('/userValues',controller.userValues.bind(controller));
router.post('/updateProfile', upload.single('profileImage'), controller.updateProfile.bind(controller));
export const handleGetuserDetails = controller.handleGetuserDetails.bind(controller);

export default router;
