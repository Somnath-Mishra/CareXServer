// import dotenv from 'dotenv';
// dotenv.config()
// import express from 'express';
// import path, { win32 } from 'path';
// import bodyParser from 'body-parser';
// import { authorize, listEvents } from './calender/listEvent.mjs'
// import { ProblemMap, findDoctors } from "./SearchDatabase/problemMapWithSpecilization.mjs"
// import { connectMongoDB } from "./connect.mjs"
// import mongoose from 'mongoose';
// import { addEventDetails, authUrl, oAuth2Client, getAccessTokenAndSetCredentials } from "./calender/addEvent.mjs"
// import { OAuth2Client } from 'google-auth-library';
// import { findSpecifications } from './GenAI/patientProblemWithSpeciliazation.mjs'
// import { Doctor } from './models/doctor.mjs';
// // import Stripe from 'stripe'
// // import Razorpay from 'razorpay'
// import fs from 'fs';
// import { stripeClient, StripeClient } from './utils/stripe/stripe';
// import { razorPayClient, RazorPayClient } from './utils/razor/razorPay';
// const app = express();
// //const authApp = express();


// const PORT = 9000;

// app.set('view engine', 'ejs');
// app.set('views', path.resolve("./views"));
// app.use(express.static('public'));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// // const stripeSecretKey = process.env.STRIPE_SECRET_API_KEY;
// // const stripePublicKey = process.env.STRIPE_PUBLIC_API_KEY;
// // const stripe = new Stripe(stripeSecretKey);

// // const rajorPaySecret = process.env.RAZORPAY_KEY_SECRET
// // const rajorPayKeyId = process.env.RAZORPAY_KEY_ID


// // let rajorPayInstance = new Razorpay({
// //   key_id: rajorPayKeyId,
// //   key_secret: rajorPaySecret
// // })

// // let orderId;

// //done

// // let doctorsDetails;
// // const medicalSpecializations = [
// //   { name: "Anesthesiology" },
// //   { name: "Cardiology" },
// //   { name: "Dermatology" },
// //   { name: "Emergency Medicine" },
// //   { name: "Endocrinology" },
// //   { name: "Family Medicine" },
// //   { name: "Gastroenterology" },
// //   { name: "General Surgery" },
// //   { name: "Hematology" },
// //   { name: "Infectious Disease" },
// //   { name: "Internal Medicine" },
// //   { name: "Nephrology" },
// //   { name: "Neurology" },
// //   { name: "Obstetrics and Gynecology (OB/GYN)" },
// //   { name: "Oncology" },
// //   { name: "Ophthalmology" },
// //   { name: "Orthopedic Surgery" },
// //   { name: "Otolaryngology (ENT)" },
// //   { name: "Pediatrics" },
// //   { name: "Physical Medicine and Rehabilitation" },
// //   { name: "Plastic Surgery" },
// //   { name: "Psychiatry" },
// //   { name: "Pulmonology" },
// //   { name: "Radiology" },
// //   { name: "Rheumatology" },
// //   { name: "Urology" }
// // ];

// //done

// // connectMongoDB().catch(err => console.log(err));


// mongoose.connection.on('disconnected', () => {
//   console.log("MongoDB is disconnected");
//   process.exit(0);
// })


// app.get('/home', async (req, res) => {
//   let mode = 'online';

//   getAccessTokenAndSetCredentials(oAuth2Client);
//   const events = await listEvents(oAuth2Client);
//   console.log(events);
//   res.render("index.ejs", { events: events, mode: mode });
// })

// app.get('/google', (req, res) => {
//   res.redirect(authUrl);
// })

// app.get('/', async (req, res) => {
//   const code = req.query.code;
//   const { token } = await oAuth2Client.getToken(code);
//   oAuth2Client.setCredentials(token);

//   oAuth2Client.on('tokens', (tokens) => {
//     if (tokens.refresh_token) {
//       //process.env.REFRESH_TOKEN = tokens.refresh_token;
//       const TOKEN_PATH = path.join(process.cwd(), 'token.json');
//       const payload = JSON.stringify({
//         scope: tokens.scope,
//         id_token: tokens.id_token,
//         token_type: tokens.token_type,
//         expiry_date: tokens.expiry_date,
//         access_token: tokens.access_token,
//         refresh_token: tokens.refresh_token,
//       });

//       fs.writeFile(TOKEN_PATH, payload, err => {
//         if (err) {
//           console.log(err);
//         }
//         else {
//           console.log("file written successfully");
//         }
//       });
//     }

//   })
//   res.redirect("/bookAppointment");
// })

// app.get('/problem', (req, res) => {
//   res.render("problem.ejs");
// })

// app.get('/blog', (req, res) => {
//   res.render("blog.ejs");
// })

// app.get('/history', (req, res) => {
//   res.render("history.ejs");
// })

// //done
// // app.post('/problem', async (req, res) => {
// //   try {
// //     let specifications = medicalSpecializations.map(specification => specification.name).join(" ");
// //     const requiredSpecifications = await findSpecifications(req.body.searchResult, specifications);
// //     const doctors = await findDoctors(requiredSpecifications);
// //     console.log(doctors);
// //     doctorsDetails = doctors;
// //     res.redirect('/doctorSuggestion');
// //   } catch (error) {
// //     console.error("Error:", error);
// //     res.status(500).send("Internal Server Error");
// //   }
// // })



// // app.get('/doctorSuggestion', (req, res) => {
// //   //res.send(doctorsDetails);
// //   res.render('doctorSuggestion.ejs', { stripePublicKey: stripePublicKey, doctorsDetails: doctorsDetails });

// // })


// app.get('/bookAppointment', (req, res) => {
//   res.render('bookAppointment');
// })

// app.post('/bookAppointment', async (req, res) => {

//   let summary = req.body.summary;
//   let description = req.body.description;
//   let startDate = req.body.startDate;
//   let startTime = req.body.startTime;
//   addEventDetails(summary, description, startDate, startTime, oAuth2Client).then(() => {
//     console.log("successfully event added")
//   })
//   res.redirect('/home');
// })


// app.post('/confirmBook', async (req, res) => {
//   const doctorId = req.body.doctorId;
//   const stripeTokenId = req.body.stripeTokenId;

//   try {
//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ message: 'Doctor not found' });
//     }

//     const fees = doctor.fees;

//     stripeClient.applyCharges(fees, stripeTokenId);
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });



// app.post('/payment', async (req, res) => {
//   let { amount } = req.body;
//   try {
//     const orderPayload = razorPayClient.createOrder(amount);
//     res.status(201).json(orderPayload);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: `Cannot create payment order by RazorPay , error : ${error}`
//     });
//   }

// })

// app.post('/', async (req, res) => {
//   let { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
//   // Validate request body
//   if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }
//   try {
//     const isValidPayment = razorPayClient.validateOrder(razorpay_payment_id, razorpay_signature);

//     if (!isValidPayment) {
//       return res.status(400).json({ error: 'Invalid signature' });
//     }

//     // Fetch the payment details from Razorpay
//     const payment = await razorPayClient.payments.fetch(razorpay_payment_id);

//     if (payment.status === 'captured') {
//       // Handle successful payment
//       res.status(200).json({ message: 'Payment successful', payment });
//     } else {
//       // Handle payment failure or pending status
//       res.status(400).json({ error: 'Payment not successful', payment });
//     }
//   } catch (error) {
//     // Log the error for debugging
//     console.error('Error verifying payment:', error);

//     // Respond with an error message
//     res.status(500).json({ error: 'Internal server error' });
//   }
// })

// // app.get('/:room', (req, res) => {
// //   res.render('room', { roomId: req.params.room });
// // });
// app.get('/test', async (req, res) => {

//   /*
//     // Define the medical specializations
//     const medicalSpecializations = [
//       "Anesthesiology",
//       "Cardiology",
//       "Dermatology",
//       "Emergency Medicine",
//       "Endocrinology",
//       "Family Medicine",
//       "Gastroenterology",
//       "General Surgery",
//       "Hematology",
//       "Infectious Disease",
//       "Internal Medicine",
//       "Nephrology",
//       "Neurology",
//       "Obstetrics and Gynecology (OB/GYN)",
//       "Oncology",
//       "Ophthalmology",
//       "Orthopedic Surgery",
//       "Otolaryngology (ENT)",
//       "Pediatrics",
//       "Physical Medicine and Rehabilitation",
//       "Plastic Surgery",
//       "Psychiatry",
//       "Pulmonology",
//       "Radiology",
//       "Rheumatology",
//       "Urology"
//     ];
  
//     // Function to generate a random specialization from the given list
//     function getRandomSpecialization() {
//       return medicalSpecializations[Math.floor(Math.random() * medicalSpecializations.length)];
//     }
  
//     // Generate 40 dummy doctor objects
//     const dummyDoctors = [];
//     for (let i = 1; i <= 40; i++) {
//       const dummyDoctor = {
//         name: `Doctor ${i}`,
//         education: `Medical School Name ${i}`,
//         specialization: [getRandomSpecialization()]
//       };
//       dummyDoctors.push(dummyDoctor);
//     }
  
//     // Now you can use dummyDoctors array as per your requirement, for example, save them to MongoDB
//     // Assuming Doctor model is defined using doctorSchema
//     dummyDoctors.forEach(async (doctorData) => {
//       const doctor = new Doctor(doctorData);
//       try {
//         await doctor.save();
//         console.log(`Doctor ${doctor.name} saved successfully.`);
//       } catch (error) {
//         console.error(`Error saving Doctor ${doctor.name}:`, error);
//       }
//     });
//     */
//   // Function to generate a random fee between $50 and $100
//   function getRandomFees() {
//     return Math.floor(Math.random() * (100 - 50 + 1)) + 50;
//   }
//   // Retrieve all documents from the collection
//   const doctors = await Doctor.find();

//   // Update each document to add the fees field with a random value
//   for (const doctor of doctors) {
//     // Check if the fees field already exists to prevent overriding existing fees
//     if (!doctor.fees) {
//       doctor.fees = getRandomFees();
//       await doctor.save();
//       console.log(`Fees added to Doctor ${doctor.name}: $${doctor.fees}`);
//     } else {
//       console.log(`Fees already exist for Doctor ${doctor.name}`);
//     }
//   }

//   console.log('All doctors updated successfully.');
//   res.send({
//     msg: "Successfully added doctor fees details"
//   })
// })


// app.listen(PORT, () => {
//   console.log(`Server is started at PORT ${PORT}`);
// })
// //authApp.listen(3003, () => {
// // console.log('Auth Server is running at PORT 3003');
// //})
