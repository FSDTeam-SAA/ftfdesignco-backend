const { Router } = require("express");
const dashboardController = require("./dashboard.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = Router();

router.get(
  "/company-summary",
  auth(USER_ROLE.company_admin),
  dashboardController.companyDashboardSummary
);

router.get(
  "/coin-report",
  auth(USER_ROLE.company_admin),
  dashboardController.companyUseCoinReportChart
);

router.get(
  "/new-products-report",
  auth(USER_ROLE.company_admin),
  dashboardController.newProductsReportChart
);

router.get(
  "/sell-category-report",
  auth(USER_ROLE.company_admin),
  dashboardController.productSellCategoryReportChart
);

const dashboardRouter = router;
module.exports = dashboardRouter;
