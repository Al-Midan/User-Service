import express from "express";
import { UserRepository } from "../../infrastructure/repository/userRepository";
import { UserUseCase } from "../../application/useCase/userUsecase";
import { userController } from "../controller/userController";
import passport from "passport"
import adminverifyToken from "../../middleware/jwtVerifyToken";
const router = express.Router();

const repository = new UserRepository();
const user = new UserUseCase(repository);
const controller = new userController(user);

router.post("/register", controller.registerUser.bind(controller));
router.post("/otp-verification", controller.otpverification.bind(controller));
router.post("/login", controller.loginUser.bind(controller));
router.get("/user-management", passport.authenticate('jwt', { session: false }), adminverifyToken, controller.getAllUsers.bind(controller));router.put("/isBlocked/:userId", controller.isBlocked.bind(controller));
export default router;
