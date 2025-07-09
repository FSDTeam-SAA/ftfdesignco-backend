const { Router } = require("express");
const cartController = require("./cart.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = Router();

router.post("/add-to-cart", auth(USER_ROLE.employee), cartController.addToCart);
router.get("/my-cart", auth(USER_ROLE.employee), cartController.getMyOwnCart);

router.delete(
  "/:cartId",
  auth(USER_ROLE.employee),
  cartController.removeFromCart
);

const cartRouter = router;
module.exports = cartRouter;
