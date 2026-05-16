const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const aiChatRoutes = require("./routes/AIChat");
const recommendationRoutes = require("./routes/Recommendation");
const quizRoutes = require("./routes/Quiz");
const { startQuizScheduler } = require("./utils/quizScheduler");
const timetableRoutes = require("./routes/Timetable");
const adminRoutes = require("./routes/Admin");

dotenv.config();

const PORT = process.env.PORT || 4000;

// Allowed origins: local dev + deployed frontend URL
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Database connect
database.connect();
startQuizScheduler();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// Cloudinary connection
cloudinaryConnect();

// Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);
app.use("/api/v1/ai", aiChatRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/timetable", timetableRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/recommendation", recommendationRoutes);

// Health check / default route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "AI-LMS Server is up and running...",
  });
});

app.listen(PORT, () => {
  console.log(`App is running at port ${PORT}`);
});
