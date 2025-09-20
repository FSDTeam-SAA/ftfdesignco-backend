const { Router } = require("express");
const userRouter = require("../modules/user/user.router");
const blogRouter = require("../modules/blog/blog.router");
const categoryRouter = require("../modules/category/category.router");
const authRouter = require("../modules/auth/auth.router");
const shopRouter = require("../modules/shop/shop.router");
const productRouter = require("../modules/product/product.router");
const assignedProduct = require("../modules/assignedProduct/assignedProduct.router");
const sendMessageRouter = require("../modules/contract/contract.router");
const paymentRouter = require("../modules/payment/payment.routes");
const employeeRouter = require("../modules/employee/employee.router");
const subscriptionPlanRouter = require("../modules/subscriptionPlan/subscriptionPlan.route");
const { path } = require("../app");
const orderRouter = require("../modules/order/order.router");
const newsLetterRouter = require("../modules/newsLetter/newsLetter.routes");
const cartRouter = require("../modules/cart/cart.router");
const dashboardRouter = require("../modules/dashboard/dashboard.router");

const router = Router();

const moduleRouter = [
  {
    path: "/user",
    router: userRouter,
  },
  {
    path: "/auth",
    router: authRouter,
  },
  {
    path: "/blog",
    router: blogRouter,
  },
  {
    path: "/category",
    router: categoryRouter,
  },
  {
    path: "/shop",
    router: shopRouter,
  },
  {
    path: "/product",
    router: productRouter,
  },
  {
    path: "/assigned-product",
    router: assignedProduct,
  },
  {
    path: "/contract",
    router: sendMessageRouter,
  },
  {
    path: "/payment",
    router: paymentRouter,
  },
  {
    path: "/employee",
    router: employeeRouter,
  },
  {
    path: "/subscription-plan",
    router: subscriptionPlanRouter,
  },
  {
    path: "/order",
    router: orderRouter,
  },
  {
    path: "/newsletter",
    router: newsLetterRouter,
  },
  {
    path: "/cart",
    router: cartRouter,
  },
  {
    path: "/dashboard",
    router: dashboardRouter,
  },
];

moduleRouter.forEach((route) => {
  router.use(route.path, route.router);
});

module.exports = router;
