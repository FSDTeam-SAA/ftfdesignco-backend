const { Router } = require("express");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");
const authController = require("./auth.controller");

const router = Router();

router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);

router.post(
  "/verify-token",
  auth(USER_ROLE.employee, USER_ROLE.company_admin, USER_ROLE.admin),
  authController.verifyToken
);

router.post(
  "/reset-password",
  auth(USER_ROLE.employee, USER_ROLE.company_admin, USER_ROLE.admin),
  authController.resetPassword
);

router.post(
  "/change-password",
  auth(USER_ROLE.employee, USER_ROLE.company_admin, USER_ROLE.admin),
  authController.changePassword
);

router.post("/employee-login", authController.employeeLogin);

router.post(
  "/employee-password",
  auth(USER_ROLE.employee),
  authController.changeEmployeePassword
);

const authRouter = router;
module.exports = authRouter;
