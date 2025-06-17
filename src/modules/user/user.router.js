const { Router } = require("express");
const userController = require("./user.controller");

const router = Router();

router.post("/register", userController.createNewAccount);

const userRouter = router;
module.exports = userRouter;
