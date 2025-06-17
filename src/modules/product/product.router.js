const router = require('express').Router();
const { upload } = require('../../utils/cloudnary');    

const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");
const {
  createProduct,
  getAllProduct,
  getProductById,
  updateProductById,
  deleteProductById,
} = require('./product.controller');

//------------------------- Product Router-------------------------
// Create product
router.post(
  '/create',
  upload.single('productImage'),
  (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  auth(USER_ROLE.admin),
  createProduct
);
// Get all products
router.get(
  '/get-all',
  auth(USER_ROLE.admin, USER_ROLE.user),
  getAllProduct
);
// Get product by ID
router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.user),
  getProductById
);

// Update product by ID
router.put(
    '/:id',
    upload.single('productImage'),
    (req, res, next) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    auth(USER_ROLE.admin),
    updateProductById
    );

// Delete product by ID
router.delete(
  '/:id',
  auth(USER_ROLE.admin),
  deleteProductById
);