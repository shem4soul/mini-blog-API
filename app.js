const dotenv = require("dotenv");
dotenv.config();
const path = require("path");

const express = require("express");
const connectDB = require("./config/db");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
// const csrf = require("csurf");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const cors = require("cors"); // ✅ add cors
const app = express();

// --- Middlewares ---
app.use(helmet());
// app.use(morgan("combined"));
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser());

// --- Serve images with proper CORS ---
// Serve images with CORS headers
app.use('/images', (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
}, express.static(path.join(__dirname, 'images')));


// --- CSRF Protection Setup ---
// const csrfProtection = csrf({ cookie: true });

// Apply CSRF protection to all routes
// app.use(csrfProtection);

// Add CSRF token to every response (so frontend can use it)
// app.use((req, res, next) => {
//   res.cookie('XSRF-TOKEN', req.csrfToken());
//   next();
// });

// --- CORS Setup ---
// Commented out Scholarguide-specific CORS
// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://scholarguide.onrender.com",
//   "https://www.scholarguidetech.com",
//   "http://scholarguidetech.com",
//   "https://scholarguide-waitlist.vercel.app",
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// };

// Use simple CORS for localhost frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- Manual CORS headers (optional, kept commented) ---
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, PATCH, DELETE"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });

// const rateLimit = require("express-rate-limit");

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests
// });

// app.use(limiter);

// --- Server Port ---
const PORT = process.env.PORT || 8080;

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
app.use("/auth", authRoutes);

// --- Error handling ---
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});
