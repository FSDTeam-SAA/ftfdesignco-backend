const AssignedProduct = require("../assignedProduct/assignedProduct.model");
const Order = require("../order/order.model");
const Shop = require("../shop/shop.model");
const User = require("../user/user.model");

const companyDashboardSummary = async (req, res) => {
  const { userId } = req.user;
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const shopData = await Shop.findOne({ userId: userId });
  if (!shopData) {
    throw new Error("Shop not found");
  }

  const totalUsedCoin = shopData.totalUsedCoin || 0;

  const liveProducts = await AssignedProduct.countDocuments({
    shopId: shopData._id,
    status: "approved",
  });

  return res.status(200).json({
    success: true,
    message: "Company dashboard summary fetched successfully",
    data: {
      totalUsedCoin,
      liveProducts,
    },
  });
};

const companyUseCoinReportChart = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const shopData = await Shop.findOne({ userId: userId });
    if (!shopData) {
      throw new Error("Shop not found");
    }

    const { filterBy = "monthly" } = req.query; // "yearly" | "monthly" | "weekly"

    // Match orders
    const matchStage = {
      shop: shopData._id,
      status: { $in: ["approved", "delivered"] },
    };

    // Group by time period
    let groupId = {};
    if (filterBy === "yearly") {
      groupId = { year: { $year: "$createdAt" } };
    } else if (filterBy === "weekly") {
      groupId = {
        year: { $year: "$createdAt" },
        week: { $week: "$createdAt" },
      };
    } else {
      // default monthly
      groupId = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
    }

    const orderData = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupId,
          totalCoinsUsed: { $sum: "$totalPayCoin" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } },
    ]);

    // Format response
    const formatted = orderData.map((d) => {
      let label = "";
      if (filterBy === "yearly") {
        label = `${d._id.year}`;
      } else if (filterBy === "weekly") {
        label = `W${d._id.week}-${d._id.year}`;
      } else {
        label = `${d._id.month}-${d._id.year}`; // month-year
      }

      return {
        label,
        totalCoinsUsed: d.totalCoinsUsed,
        orderCount: d.orderCount,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Company coin usage report fetched successfully",
      filterBy,
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const newProductsReportChart = async (req, res) => {};

const dashboardController = {
  companyDashboardSummary,
  companyUseCoinReportChart,
  newProductsReportChart,
};
module.exports = dashboardController;
