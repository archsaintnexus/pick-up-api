import mongoose from "mongoose";

const connectDB = () => {
    
const DB = process.env.DATABASE!.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD!
);

mongoose
.connect(DB)
.then(() => console.log("Database connection is successful"))
.catch((err) => console.log(err));
}   


export default connectDB