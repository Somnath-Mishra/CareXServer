import { Doctor } from "../../models/doctor.model.js";
import { Problem } from "../../models/problems.mjs";

async function ProblemMap(disease) {
  const specializations = await Problem.findOne({ problem: disease });
  if (specializations && specializations.requiredSpecilization.length > 0) {
    const doctorDetails = await Promise.all(
      specializations.requiredSpecilization.map(findDoctorDetails),
    );

    const uniqueDetails = await uniqueDoctorsList(doctorDetails.flat());
    console.log(uniqueDetails);
    return uniqueDetails;
  } else {
    let doctorsDetails = await Doctor.find({
      specialization: "generalMedicine",
    });
    return doctorsDetails;
  }
}

async function findDoctors(specialization) {
  let requiredSpecializations = specialization.split(",");

  let doctorArray = [];
  for (let spec of requiredSpecializations) {
    let details = await findDoctorDetails(spec);
    if (details.length > 0)
      // Check if details are found
      doctorArray.push(details);
  }
  console.log("findDoctors(): doctorArray : " + doctorArray);
  let doctorsInfo = await uniqueDoctorsList(doctorArray);
  return doctorsInfo;
}

async function findDoctorDetails(specialization) {
  let doctorsDetails = await Doctor.find({ specialization: specialization }).select("-password -refreshToken");
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

async function getUniqueSpecializations() {
  // const uniqueSpecialization = await Doctor.aggregate([
  //   { $unwind: "$specialization" },
  //   { $group: { _id: "$specialization" } },
  //   { $sort: { _id: 1 } }
  // ]);
  // let specializations = uniqueSpecialization.map(spec => ({ name: spec._id }));

  // console.log(specializations); // Log to verify the structure

  // return specializations;
  const availableKeywords = [
    { name: "Anesthesia Complications" },
    { name: "Heart Disease" },
    { name: "Arrhythmia" },
    { name: "Hypertension" },
    { name: "Skin Cancer" },
    { name: "Acne" },
    { name: "Eczema" },
    { name: "Trauma" },
    { name: "Heart Attack" },
    { name: "Stroke" },
    { name: "Diabetes" },
    { name: "Thyroid Disorders" },
    { name: "Obesity" },
    { name: "Common Cold" },
    { name: "Flu" },
    { name: "High Blood Pressure" },
    { name: "Gastritis" },
    { name: "Ulcers" },
    { name: "Irritable Bowel Syndrome" },
    { name: "Appendicitis" },
    { name: "Hernia" },
    { name: "Gallstones" },
    { name: "Anemia" },
    { name: "Leukemia" },
    { name: "Hemophilia" },
    { name: "Influenza" },
    { name: "HIV/AIDS" },
    { name: "Malaria" },
    { name: "Pneumonia" },
    { name: "Kidney Stones" },
    { name: "Chronic Kidney Disease" },
    { name: "Urinary Tract Infection" },
    { name: "Alzheimer's Disease" },
    { name: "Epilepsy" },
    { name: "Pregnancy Complications" },
    { name: "Endometriosis" },
    { name: "Breast Cancer" },
    { name: "Lung Cancer" },
    { name: "Colon Cancer" },
    { name: "Cataracts" },
    { name: "Glaucoma" },
    { name: "Macular Degeneration" },
    { name: "Fractures" },
    { name: "Arthritis" },
    { name: "ACL Tear" },
    { name: "Sinusitis" },
    { name: "Ear Infections" },
    { name: "Tonsillitis" },
    { name: "Asthma" },
    { name: "ADHD" },
    { name: "Muscle Strain" },
    { name: "Joint Pain" },
    { name: "Spinal Cord Injury" },
    { name: "Breast Augmentation" },
    { name: "Rhinoplasty" },
    { name: "Liposuction" },
    { name: "Depression" },
    { name: "Anxiety Disorders" },
    { name: "Schizophrenia" },
    { name: "Chronic Obstructive Pulmonary Disease (COPD)" },
    { name: "X-ray Imaging" },
    { name: "CT Scan" },
    { name: "MRI Scan" },
    { name: "Rheumatoid Arthritis" },
    { name: "Osteoarthritis" },
    { name: "Lupus" },
    { name: "Prostate Cancer" },
  ];

  return availableKeywords;
}



export { ProblemMap, findDoctors, getUniqueSpecializations };
