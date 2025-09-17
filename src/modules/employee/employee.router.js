const { Router } = require("express");
const employeeController = require("./employee.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");
const { upload } = require("../../utils/cloudnary");

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

router.get(
  "/profile",
  auth(USER_ROLE.employee),
  employeeController.getEmployeeProfile
);

router.put(
  "/:employeeId",
  auth(USER_ROLE.company_admin, USER_ROLE.admin),
  employeeController.employeeCoinGive
);

router.get(
  "/shop-products",
  auth(USER_ROLE.employee),
  employeeController.getEmployeeShopProducts
);

router.patch(
  "/update",
  upload.single("image"),
  (req, res, next) => {
    if (req.body?.data) {
      try {
        req.body = JSON.parse(req.body.data);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format in 'data' field",
        });
      }
    }
    // If no `data`, req.body remains an empty object or unchanged
    next();
  },
  auth(USER_ROLE.employee),
  employeeController.updateEmployeeProfile
);

router.delete(
  "/remove/:employeeId",
  auth(USER_ROLE.company_admin),
  employeeController.deletedEmployee
);

const employeeRouter = router;
module.exports = employeeRouter;
