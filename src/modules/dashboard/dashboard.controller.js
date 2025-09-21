const AssignedProduct = require("../assignedProduct/assignedProduct.model");
const Order = require("../order/order.model");
const { Payment } = require("../payment/payment.model");
const Product = require("../product/product.model");
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

const newProductsReportChart = async (req, res) => {
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

    // Define time ranges
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Aggregate data
    const [todayCount, weekCount, monthCount] = await Promise.all([
      AssignedProduct.countDocuments({
        shopId: shopData._id,
        createdAt: { $gte: startOfDay },
      }),
      AssignedProduct.countDocuments({
        shopId: shopData._id,
        createdAt: { $gte: startOfWeek },
      }),
      AssignedProduct.countDocuments({
        shopId: shopData._id,
        createdAt: { $gte: startOfMonth },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Total new products report fetched successfully",
      data: {
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const productSellCategoryReportChart = async (req, res) => {
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

    // Fetch approved orders for this shop
    const orders = await Order.find({
      shop: shopData._id,
      status: "approved",
    }).populate("items.productId");

    // if (!orders.length) {
    //   return res.status(200).json({
    //     success: true,
    //     message: "No sales data found",
    //     data: [],
    //   });
    // }

    // Count sales per category
    const categorySales = {};

    for (const order of orders) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId).populate(
          "category"
        );
        if (product && product.category) {
          const categoryId = product.category._id.toString();
          if (!categorySales[categoryId]) {
            categorySales[categoryId] = {
              categoryName: product.category.title,
              totalQuantity: 0,
            };
          }
          categorySales[categoryId].totalQuantity += item.quantity;
        }
      }
    }

    // Convert to array
    const categoryArray = Object.values(categorySales);

    // Calculate total
    const totalQuantity = categoryArray.reduce(
      (sum, c) => sum + c.totalQuantity,
      0
    );

    // Add percentage
    const finalResult = categoryArray.map((c) => ({
      category: c.categoryName,
      percentage: ((c.totalQuantity / totalQuantity) * 100).toFixed(2) + "%",
    }));

    return res.status(200).json({
      success: true,
      message: "Product sell category report fetched successfully",
      data: finalResult,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAdminDashboardSummary = async (req, res) => {
  try {
    const totalLiveProducts = await Product.countDocuments();
    const totalCompanies = await Shop.countDocuments({ status: "approved" });
    const totalProductRequests = await AssignedProduct.countDocuments({
      status: "pending",
    });
    // const liveProducts = await Product.countDocuments();
    const companyRequests = await Shop.countDocuments({ status: "pending" });
    const payments = await Payment.find({
      status: "success",
      type: "payOrder",
    });
    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

    return res.status(200).json({
      success: true,
      message: "Admin dashboard summary fetched successfully",
      data: {
        totalRevenue,
        totalLiveProducts,
        totalCompanies,
        totalProductRequests,
        // liveProducts,
        companyRequests,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const adminTotalNewProductsReport = async (req, res) => {
  try {
    const { filterBy } = req.query;
    const now = new Date();

    // Start dates
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfYear = new Date(now.getFullYear(), 0, 1);

    if (filterBy) {
      let startDate;

      switch (filterBy.toLowerCase()) {
        case "daily":
          startDate = startOfDay;
          break;
        case "weekly":
          startDate = startOfWeek;
          break;
        case "monthly":
          startDate = startOfMonth;
          break;
        case "yearly":
          startDate = startOfYear;
          break;
        default:
          return res.status(400).json({
            success: false,
            message:
              "Invalid filterBy value. Use: daily, weekly, monthly, or yearly.",
          });
      }

      const total = await Product.countDocuments({
        createdAt: { $gte: startDate },
      });

      return res.status(200).json({
        success: true,
        message: `Admin total new products report fetched successfully (${filterBy})`,
        data: {
          filterBy,
          total,
          startDate,
          endDate: new Date(),
        },
      });
    } else {
      // Overview mode → all at once
      const [day, week, month, year] = await Promise.all([
        Product.countDocuments({ createdAt: { $gte: startOfDay } }),
        Product.countDocuments({ createdAt: { $gte: startOfWeek } }),
        Product.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Product.countDocuments({ createdAt: { $gte: startOfYear } }),
      ]);

      return res.status(200).json({
        success: true,
        message: "Admin total new products report fetched successfully (all)",
        data: { day, week, month, year },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const productSellCategoryReportChartForAdmin = async (req, res) => {
  try {
    // Fetch all approved orders
    const orders = await Order.find({ status: "approved" }).populate(
      "items.productId"
    );

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        message: "No sales data found",
        data: [],
      });
    }

    // Count sales per category
    const categorySales = {};

    for (const order of orders) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId).populate(
          "category"
        );
        if (product && product.category) {
          const categoryId = product.category._id.toString();
          if (!categorySales[categoryId]) {
            categorySales[categoryId] = {
              categoryName: product.category.title,
              totalQuantity: 0,
            };
          }
          categorySales[categoryId].totalQuantity += item.quantity;
        }
      }
    }

    // Convert to array
    const categoryArray = Object.values(categorySales);

    // Calculate grand total
    const totalQuantity = categoryArray.reduce(
      (sum, c) => sum + c.totalQuantity,
      0
    );

    // Add percentage share
    const finalResult = categoryArray.map((c) => ({
      category: c.categoryName,
      percentage: ((c.totalQuantity / totalQuantity) * 100).toFixed(2) + "%",
    }));

    return res.status(200).json({
      success: true,
      message: "Admin product sell category report fetched successfully",
      data: finalResult,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const revenueReportChartForAdmin = async (req, res) => {
  try {
    const { filterBy = "year" } = req.query;
    const now = new Date();
    const thisYear = now.getFullYear();
    const lastYear = thisYear - 1;

    let startDate;
    let groupBy;

    // Define filter range and grouping
    switch (filterBy.toLowerCase()) {
      case "day":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        groupBy = { hour: { $hour: "$createdAt" } };
        break;

      case "week":
        startDate = new Date();
        startDate.setDate(now.getDate() - now.getDay()); // start of week (Sunday)
        startDate.setHours(0, 0, 0, 0);
        groupBy = { day: { $dayOfWeek: "$createdAt" } }; // 1=Sunday … 7=Saturday
        break;

      case "month":
        startDate = new Date(thisYear, now.getMonth(), 1);
        groupBy = { day: { $dayOfMonth: "$createdAt" } };
        break;

      case "year":
      default:
        startDate = new Date(thisYear - 1, 0, 1); // last year Jan 1st
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        break;
    }

    // Aggregate payments
    const payments = await Payment.aggregate([
      {
        $match: {
          status: "success",
          type: "payOrder",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    let result = {};

    if (filterBy === "day") {
      // 24 hours
      const data = Array(24).fill(0);
      payments.forEach((p) => {
        data[p._id.hour] = p.totalRevenue;
      });
      result = {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        data,
      };
    } else if (filterBy === "week") {
      // 7 days
      const data = Array(7).fill(0);
      payments.forEach((p) => {
        data[p._id.day - 1] = p.totalRevenue; // shift Sunday=0
      });
      result = {
        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        data,
      };
    } else if (filterBy === "month") {
      // Days in month
      const daysInMonth = new Date(thisYear, now.getMonth() + 1, 0).getDate();
      const data = Array(daysInMonth).fill(0);
      payments.forEach((p) => {
        data[p._id.day - 1] = p.totalRevenue;
      });
      result = {
        labels: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
        data,
      };
    } else {
      // Yearly: compare thisYear vs lastYear
      const thisYearData = Array(12).fill(0);
      const lastYearData = Array(12).fill(0);

      payments.forEach((p) => {
        const { year, month } = p._id;
        if (year === thisYear) {
          thisYearData[month - 1] = p.totalRevenue;
        } else if (year === lastYear) {
          lastYearData[month - 1] = p.totalRevenue;
        }
      });

      result = {
        labels: [
          "JAN",
          "FEB",
          "MAR",
          "APR",
          "MAY",
          "JUN",
          "JUL",
          "AUG",
          "SEP",
          "OCT",
          "NOV",
          "DEC",
        ],
        thisYear: thisYearData,
        lastYear: lastYearData,
      };
    }

    return res.status(200).json({
      success: true,
      message: `Revenue report (${filterBy}) fetched successfully`,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const dashboardController = {
  companyDashboardSummary,
  companyUseCoinReportChart,
  newProductsReportChart,
  productSellCategoryReportChart,
  getAdminDashboardSummary,
  adminTotalNewProductsReport,
  productSellCategoryReportChartForAdmin,
  revenueReportChartForAdmin,
};
module.exports = dashboardController;
