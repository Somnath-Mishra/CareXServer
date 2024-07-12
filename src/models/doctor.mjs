import mongoose from 'mongoose';
const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  education: {
    type: String,

  },
  specialization: {
    type: Array,
    required: true,
    trim: true
  },
  fees: {
    type: Number,
    required: true
  }
});
const Doctor = mongoose.model("Doctor", doctorSchema);

// export { Doctor };
