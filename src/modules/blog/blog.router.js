const express = require("express");
const router = express.Router();
const { upload } = require("../../utils/cloudnary");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");
const {
  createBlog,
  getAllBlog,
  getSingleBlog,
  deleteBlog,
  updateBlog,
} = require("./blog.controller");
//------------------------- Blog Router-------------------------
//create blog
router.post(
  "/create",
  upload.single("image"),
  (req, res, next) => {
    if (req.body?.data) {
      try {
        req.body = JSON.parse(req.body.data);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format in 'data' field",
        });
      }
    }
    // If no `data`, req.body remains an empty object or unchanged
    next();
  },
//   auth(USER_ROLE.admin),
  createBlog
);

//get all blogs
router.get(
  "/",
  // auth(USER_ROLE.admin, USER_ROLE.user),
  getAllBlog
);

//get blog by id
router.get("/:id",getSingleBlog);

//update blog
router.put(
  "/:id",
  upload.single("image"),
  (req, res, next) => {
    if (req.body?.data) {
      try {
        req.body = JSON.parse(req.body.data);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format in 'data' field",
        });
      }
    }
    // If no `data`, req.body remains an empty object or unchanged
    next();
  },
//   auth(USER_ROLE.admin),
  updateBlog
);

//delete blog
router.delete("/:id", auth(USER_ROLE.admin), deleteBlog);

const blogRouter = router;
module.exports = blogRouter;
//------------------------- End of Blog Router-------------------------
