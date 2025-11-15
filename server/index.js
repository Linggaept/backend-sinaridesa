const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../swagger");
const { PrismaClient } = require("../generated/prisma");
require("dotenv").config();

const limiter = require("./middlewares/rateLimiter");
const apiKeyMiddleware = require("./middlewares/apiKey");
const routes = require("./routes");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5000",
      "http://localhost:5001",
      "https://sinaridesa.com",
      "https://www.sinaridesa.com",
      "http://20.6.8.101",
      "http://35.219.118.229"
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Swagger Docs - Publicly accessible
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes - Protected by API Key
app.use("/api", apiKeyMiddleware, routes);

// Health check
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: error.message,
    });
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📚 API Docs: http://0.0.0.0:${PORT}/api-docs`);
});
