import mongoose from "mongoose"
const problemSchema = new mongoose.Schema({
  problem: String,
  requiredSpecilization: Array

})

const Problem = mongoose.model("Problems", problemSchema);

export { Problem };
