import mongoose from "mongoose";

const mongodbURL = "mongodb://127.0.0.1:27017/CareXDB"

async function connectMongoDB() {
  await mongoose.connect(mongodbURL)
}

export { connectMongoDB };
