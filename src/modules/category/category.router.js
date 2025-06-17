const express = require('express');
const router = express.Router();
const { upload } = require('../../utils/cloudnary');
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");
const { createCategory, getAllCategory, getCategoryById } = require('./category.controller');

//------------------------- Category Router-------------------------
// Create category
router.post(
    "/create",
    upload.single("categoryThumbnail"),
    (req, res, next) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    auth(USER_ROLE.admin),
    createCategory
);
// Get all categories
router.get(
    "/get-all",
    auth(USER_ROLE.admin, USER_ROLE.user),
    getAllCategory
);

// Get category by ID
router.get(
    "/:id",
    auth(USER_ROLE.admin, USER_ROLE.user),
    getCategoryById
);

// Update category by ID
router.put(
    "/:id",
    upload.single("categoryThumbnail"),
    (req, res, next) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    auth(USER_ROLE.admin),
    getCategoryById
);
// Delete category by ID
router.delete(
    "/:id",
    auth(USER_ROLE.admin),
    getCategoryById
);

const categoryRouter = router;
module.exports = categoryRouter;