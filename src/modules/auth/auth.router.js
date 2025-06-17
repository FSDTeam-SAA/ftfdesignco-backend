const { Router } = require("express");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");
const authController = require("./auth.controller");

const router = Router();

router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);

const authRouter = router;
module.exports = authRouter;
