const express = require("express");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const { rateLimit } = require("express-rate-limit");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const corsOptions = {
  origin: true, // This will enable CORS for all origins
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use(require("./routes"))
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 2, // Limit each IP to 100 requests per windowMs
  message: "Too many requests,2 req/minute allowed",
});

app.use(limiter);

app.listen(process.env.PORT ? process.env.PORT : 3000, function () {
  console.log(
    `Server is running on port ${process.env.PORT ? process.env.PORT : 3000}`
  );
});

