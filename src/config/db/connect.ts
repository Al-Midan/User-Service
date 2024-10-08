import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

console.log("MONGO_URL from env:",process.env.MONGO_URL);

if(!process.env.MONGO_URL){
    console.log("MONGO_URL is not set, using fallback URL");
}

const mongoUrl=process.env.MONGO_URL||"mongodb://mongodb-service:27017/Al-Midan";

console.log("Final MONGO_URL:", mongoUrl);

const connectDb = mongoose.connect(mongoUrl)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((e) => console.log("MongoDB Connection Failed", e));

export default connectDb;