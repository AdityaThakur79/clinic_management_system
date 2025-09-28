import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

  } catch (error) {

  }
};

export default connectDB;
