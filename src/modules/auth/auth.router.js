const { Router } = require("express");
const authController = require("./auth.controller");

const router = Router();

router.post("/login", authController.loginUser);

const authRouter = router;
module.exports = authRouter;
