const { Router } = require("express");
const employeeController = require("./employee.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");
 
const router = Router();

router.post(
  "/create-employee",
  auth(USER_ROLE.company_admin, USER_ROLE.admin),
  employeeController.createEmployee
);

router.get(
  "/",
  auth(USER_ROLE.company_admin, USER_ROLE.admin),
  employeeController.getMyEmployees
);

const employeeRouter = router;
module.exports = employeeRouter;
