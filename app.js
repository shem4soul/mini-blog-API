const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const connectDB = require("./config/db");

const feedRoutes = require("./routes/feed");

// ✅ Security & Logging
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

app.use(express.json());

// ✅ Apply security and logging middlewares
app.use(helmet());
app.use(morgan("combined"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// const rateLimit = require("express-rate-limit");

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests
// });

// app.use(limiter);

// const cors = require("cors");

// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://scholarguide.onrender.com",
//   "https://www.scholarguidetech.com",
//   "http://scholarguidetech.com",
//   "https://scholarguide-waitlist.vercel.app",
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// };

// app.use(cors(corsOptions));

const PORT = process.env.PORT || 6000;

// ✅ Connect to MongoDB
connectDB()
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err.message);
  });

// ✅ Register routes
app.use("/feed", feedRoutes);
