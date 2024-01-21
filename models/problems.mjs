import mongoose from "mongoose"
const problemSchema = new mongoose.Schema({
  problem: string,
  requiredSpecilization: Array

})

const Problem = mongoose.model("Problems", problemSchema);

export default Problem;
