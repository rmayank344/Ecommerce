const express = require("express");
const app = express();
const morgan = require("morgan");
const {notFound, errorHandler} = require("./middleware/errorHandler");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 8000;
require("./DB/conn");

// routes
app.use("/api/user", require("./routes/authRoutes"));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/blog", require("./routes/blogRoutes"));
app.use("/api/product-category", require("./routes/prodCategoryRoutes"));
app.use("/api/blog-category", require("./routes/blogCategoryRoutes"));
app.use("/api/brand", require("./routes/brandRoutes"));
app.use("/api/coupon", require("./routes/couponRoutes"));
app.use("/api/address", require("./routes/addressRoutes"));


app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});