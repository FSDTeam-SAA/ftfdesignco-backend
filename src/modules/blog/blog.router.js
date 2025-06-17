const express = require('express');
const router = express.Router();
const { upload } = require('../../utilts/cloudnary');
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");
const { createBlog, getAllBlog, getSingleBlog, deleteBlog, updateBlog } = require('./blog.controller');
//------------------------- Blog Router-------------------------
//create blog
router.post(
    "/create",
    upload.single("image"),
    (req, res, next) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    auth(USER_ROLE.admin),
    createBlog
);

//get all blogs
router.get(
    "/",
    auth(USER_ROLE.admin, USER_ROLE.user),
    getAllBlog
);

//get blog by id
router.get(
    "/:id",
    auth(USER_ROLE.admin, USER_ROLE.user),
    getSingleBlog
);

//update blog
router.put(
    "/:id",
    upload.single("image"),
    (req, res, next) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    auth(USER_ROLE.admin),
    updateBlog
);

//delete blog
router.delete(
    "/:id",
    auth(USER_ROLE.admin),
    deleteBlog
)