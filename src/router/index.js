const { Router } = require("express");
const userRouter = require("../modules/user/user.router");
const blogRouter = require("../modules/blog/blog.router");
const categoryRouter = require("../modules/category/category.router");
const authRouter = require("../modules/auth/auth.router");
const shopRouter = require("../modules/shop/shop.router");
const productRouter = require("../modules/product/product.router");
const requestProduct = require("../modules/requestProducts/requestProduct.router");
const assignedProduct = require("../modules/assignedProduct/assignedProduct.router");
const sendMessageRouter = require("../modules/contract/contract.router");
const paymentRouter = require("../modules/payment/payment.routes");
const employeeRouter = require("../modules/employee/employee.router");
const subscriptionPlanRouter = require('../modules/subscriptionPlan/subscriptionPlan.route')
const newsLetterRouter = require('../modules/newsLetter/newsLetter.routes')


const { path } = require("../app");

const router = Router();

const moduleRouter = [
  {
    path: '/user',
    router: userRouter,
  },
  {
    path: '/auth',
    router: authRouter,
  },
  {
    path: '/blog',
    router: blogRouter,
  },
  {
    path: '/category',
    router: categoryRouter,
  },
  {
    path: '/shop',
    router: shopRouter,
  },
  {
    path: '/product',
    router: productRouter,
  },
  {
    path: '/request-product',
    router: requestProduct,
  },
  {
    path: '/assigned-product',
    router: assignedProduct,
  },
  {
    path: '/contract',
    router: sendMessageRouter,
  },
  {
    path: '/payment',
    router: paymentRouter,
  },
  {
    path: '/employee',
    router: employeeRouter,
  },
  {
    path: '/subscription-plan',
    router: subscriptionPlanRouter,
  },
  {
    path: '/newsletter',
    router: newsLetterRouter,
  },
]

moduleRouter.forEach((route) => {
  router.use(route.path, route.router);
});

module.exports = router;
