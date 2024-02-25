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

async function findDoctors(specialization) {
  console.log("Inside findDoctors(): " + specialization)
  let requiredSpecializations = specialization.split(",");

  let doctorArray = [];
  for (let spec of requiredSpecializations) {
    let details = await findDoctorDetails(spec);
    if (details.length > 0) // Check if details are found
      doctorArray.push(details);
  }
  console.log("findDoctors(): doctorArray : " + doctorArray);
  let doctorsInfo = await uniqueDoctorsList(doctorArray);
  return doctorsInfo;
}


async function findDoctorDetails(specialization) {
  let doctorsDetails = await Doctor.find({ specialization: specialization });
  console.log("findDoctorDetails(): " + doctorsDetails);
  return doctorsDetails;
}


async function uniqueDoctorsList(doctorsDetails) {
  const uniqueDoctorsSet = new Set(doctorsDetails.map(JSON.stringify));
  console.log("uniqueDoctorsList(): uniqueDoctorsSet:  " + uniqueDoctorsSet);
  const uniqueDoctorsArray = Array.from(uniqueDoctorsSet).map(JSON.parse);
  console.log("uniqueDoctorsArray: " + uniqueDoctorsArray);
  return uniqueDoctorsArray;
}

export { ProblemMap, findDoctors } 
