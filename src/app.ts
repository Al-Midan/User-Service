import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import router from "./presentation/routes/userRouter"
import connectDb from "./config/db/connect"
import  Session  from "express-session"
import cookieParser from 'cookie-parser';
import "./config/passport-jwt-strategy"
import passport from "./utils/passport-google-auth"
import { kafkaProducer } from "./infrastructure/broker/kafkaBroker/kafkaProducer"
import { consumeUserDetails } from "./infrastructure/broker/kafkaBroker/kafkaConsumer"
dotenv.config()
const allowedOrigins = [
  'https://al-midan-frontend.vercel.app',
  'https://localhost:3000',
  'http://13.71.112.129',
  'https://peducoggsc.execute-api.ap-south-1.amazonaws.com'
];
const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
  credentials: true,
};
const app = express()
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  Session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/", router)
async function startApp() {
  try {
    // Connect to MongoDB
    const response = await connectDb;
    console.log("MongoDB connected Message",response);

    // Initialize Kafka producer
    await kafkaProducer.connect();
    console.log("Kafka producer connected successfully");

    // Start consuming user Detail requests
    await consumeUserDetails();
    console.log("Kafka consumer started successfully");

    // Start the server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error starting the application:", err);
    process.exit(1);
  }
}

startApp();