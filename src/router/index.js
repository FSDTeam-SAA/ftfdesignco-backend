const { Router } = require("express");
const userRouter = require("../modules/user/user.router");
const blogRouter = require("../modules/blog/blog.router");
const categoryRouter = require("../modules/category/category.router");
const authRouter = require("../modules/auth/auth.router");
const shopRouter = require("../modules/shop/shop.router");

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
  //CATEGORY ROUTER
  {
    path: "/category",
    router: categoryRouter,
  },
  {
    path: "/shop",
    router: shopRouter,
  },
];

moduleRouter.forEach((route) => {
  router.use(route.path, route.router);
});

module.exports = router;
