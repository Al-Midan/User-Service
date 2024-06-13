import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import router from "./presentation/routes/userRouter"
import connectDb from "./config/db/connect"
import cookieParser from 'cookie-parser';
import "./config/passport-jwt-strategy"
dotenv.config()
const app = express()
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
  console.log('Request Headers:', req.headers);
  next();
});
app.use("/", router)
connectDb
  .then(() => {
    console.log('MongoDB connected successfully');

    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });