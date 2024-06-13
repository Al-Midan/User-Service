import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


if(!process.env.MONGO_URL){
    throw new Error("No connection between database ")
}
const connectDb =  mongoose.connect(process.env.MONGO_URL as string)
.then(()=>console.log("Mongodb Conencted Successfully"))
.catch((e)=>console.log("Mongodb Connection Failed",e));

export default connectDb;

