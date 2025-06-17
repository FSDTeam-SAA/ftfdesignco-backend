const { Router } = require("express");

const router = Router();

const moduleRouter = [
  {
    path: "/user",
    router: userRouter,
  },
];

moduleRouter.forEach((route) => {
  router.use(route.path, route.router);
});

module.exports = router;