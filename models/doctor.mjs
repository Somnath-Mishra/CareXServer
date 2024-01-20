import mongoose from 'mongoose';
const doctormodel = new mongoose.Schema({
    Id:{
        type : String,
        required : true,
        trim : true
    },
    name :{
        type : String,
        required : true,
        trim : true
    },
    spciealization :{
        type : String ,
        required : true,
        trim : true
    }
});
const  models = mongoose.model("Doctor",doctormodel);
module.exports = models;