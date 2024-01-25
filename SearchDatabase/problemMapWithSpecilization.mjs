import { Doctor } from '../models/doctor.mjs'
import { Problem } from "../models/problems.mjs"


async function ProblemMap(disease) {
  const specializations = await Problem.findOne({ problem: disease });
  if (specializations && specializations.requiredSpecilization.length > 0) {
    const doctorDetails = await Promise.all(
      specializations.requiredSpecilization.map(findDoctorDetails)
    );

    const uniqueDetails = await uniqueDoctorsList(doctorDetails.flat());
    console.log(uniqueDetails);
    return uniqueDetails;
  } else {
    let doctorsDetails = await Doctor.find({ specialization: "generalMedicine" });
    return doctorsDetails;
  }
}


async function findDoctorDetails(specialization) {
  let doctorsDetails = await Doctor.find({ specialization: specialization });
  console.log(doctorsDetails)
  return doctorsDetails;

}


async function uniqueDoctorsList(doctorsDetails) {
  const uniqueDoctorsSet = new Set(doctorsDetails.map(JSON.stringify));
  const uniqueDoctorsArray = Array.from(uniqueDoctorsSet).map(JSON.parse);
  return uniqueDoctorsArray;
}

export { ProblemMap } 
