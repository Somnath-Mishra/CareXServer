/* let availableKeywords = [
  "Arthritis",
  "Back Pain",
  "Stomach Infection",
  "Headache",
  "Throat Infection",
  "Cough and cold",
  "Fever",
  "Burn Injury/Accidents",
  "Sports Injury",
  "Chest Pain",
  "Anxiety"
];
*/
const availableKeywords = [
  "Anesthesia Complications",
  "Heart Disease", "Arrhythmia", "Hypertension",
  "Skin Cancer", "Acne", "Eczema",
  "Trauma", "Heart Attack", "Stroke",
  "Diabetes", "Thyroid Disorders", "Obesity",
  "Common Cold", "Flu", "High Blood Pressure",
  "Gastritis", "Ulcers", "Irritable Bowel Syndrome",
  "Appendicitis", "Hernia", "Gallstones",
  "Anemia", "Leukemia", "Hemophilia",
  "Influenza", "HIV/AIDS", "Malaria",
  "Pneumonia", "Diabetes", "Hypertension",
  "Kidney Stones", "Chronic Kidney Disease", "Urinary Tract Infection",
  "Stroke", "Alzheimer's Disease", "Epilepsy",
  "Pregnancy Complications", "Endometriosis", "Breast Cancer",
  "Breast Cancer", "Lung Cancer", "Colon Cancer",
  "Cataracts", "Glaucoma", "Macular Degeneration",
  "Fractures", "Arthritis", "ACL Tear",
  "Sinusitis", "Ear Infections", "Tonsillitis",
  "Ear Infections", "Asthma", "ADHD",
  "Muscle Strain", "Joint Pain", "Spinal Cord Injury",
  "Breast Augmentation", "Rhinoplasty", "Liposuction",
  "Depression", "Anxiety Disorders", "Schizophrenia",
  "Asthma", "Chronic Obstructive Pulmonary Disease (COPD)", "Pneumonia",
  "X-ray Imaging", "CT Scan", "MRI Scan",
  "Rheumatoid Arthritis", "Osteoarthritis", "Lupus",
  "Urinary Tract Infection", "Kidney Stones", "Prostate Cancer"
];


const resultsbox = document.querySelector(".result-box");

const inputBox = document.getElementById("input-box");

inputBox.onkeyup = function() {
  let result = [];
  let input = inputBox.value;
  if (input.length) {
    result = availableKeywords.filter((keyword) => {
      return keyword.toLowerCase().includes(input.toLowerCase());
    })
  }
  display(result);

  if (!result.length) {
    resultsbox.innerHTML = "";
  }
}

function display(result) {
  const content = result.map((list) => {
    return "<li onclick=selectInput(this)>" + list + "</li>";
  })

  resultsbox.innerHTML = "<ul>" + content.join('') + "</ul>"
}

function selectInput(list) {
  inputBox.value = list.innerHTML;
  resultsbox.innerHTML = "";
}

