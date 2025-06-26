const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const globalErrorHandler = require("./middleware/globalErrorHandler");
const notFound = require("./middleware/notFound");
const router = require("./router");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "*",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/v1", router);

app.use("/", (req, res) => {
  return res.send("Your server is running!");
});

app.use(globalErrorHandler);
app.use(notFound);

module.exports = app;

//? -------------------- some isue ----------------------

//TODO: 1: Auth guard checking........
//TODO: 2: category deleted logic problem........ beacuse category is under the product, if i deleted and some employee buy this product then i cann't get which category product this is. Same in subscription.
//TODO: 3: AddProductToShop -> there are some problem i think beacuse there i add coin when company_admin add product in his shop.
//TODO 4: Api testing is not completed. if same product add then updated everything[my opinion].
//TODO 5: employee profile is not updated. Api not completed.
