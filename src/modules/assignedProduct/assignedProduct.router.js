const { Router } = require("express");
const assignedProductController = require("./assignedProduct.controller");

const router = Router();

router.get("/", assignedProductController.getAssignedProducts);

const assignedProduct = router;
module.exports = assignedProduct;
