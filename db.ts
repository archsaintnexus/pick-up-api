import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const DB = process.env.DATABASE?.replace(
      "<db_password>",
      process.env.DATABASE_PASSWORD || ""
    );

    if (!DB) {
      throw new Error("DATABASE is not defined in config.env");
    }

    await mongoose.connect(DB);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;




