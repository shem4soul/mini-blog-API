const express = require('express');

const feedRoutes = require('./routes/feed');


const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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


app.use('/feed', feedRoutes);

app.listen(8080);