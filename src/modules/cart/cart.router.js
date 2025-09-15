const { Router } = require("express");
const cartController = require("./cart.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = Router();

router.post("/add-to-cart", auth(USER_ROLE.employee), cartController.addToCart);
router.get("/my-cart", auth(USER_ROLE.employee), cartController.getMyOwnCart);

router.put(
  "/increment/:cartId",
  auth(USER_ROLE.employee),
  cartController.incrementQuantity
);

router.put(
  "/decrement/:cartId",
  auth(USER_ROLE.employee),
  cartController.decrementQuantity
);

router.delete(
  "/:cartId",
  auth(USER_ROLE.employee),
  cartController.removeFromCart
);

const cartRouter = router;
module.exports = cartRouter;
