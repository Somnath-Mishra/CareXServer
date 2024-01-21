import { Doctor } from '../models/doctor.mjs'
import { Problem } from "../models/problems.mjs"

async function ProblemMap(disease) {
  const specializations = await Problem.find({ problem: disease });
  if (specializations) {
    let doctorDetails = [];
    specializations.forEach(function(specialization) {
      doctorDetails.push(findDoctorDetails(specialization));
    })

    doctorDetails = uniqueDoctorsList(doctorsDetails);
    console.log(doctorDetails);
    return doctorDetails;

  } else {
    let doctorsDetails = await Doctor.find({ specialization: { $in: ["generalMedicine"] } });
    return doctorsDetails;
  }
}


async function findDoctorDetails(specialization) {
  let doctorsDetails = await Doctor.find({ specialization: { $in: specialization } });
  return doctorsDetails;

}

async function uniqueDoctorsList(doctorsDetails) {
  doctorsDetails = doctorsDetails.filter(function(item, pos) {
    return doctorsDetails.indexOf(item) == pos;
  })
  return doctorsDetails;
}

export { ProblemMap } 
