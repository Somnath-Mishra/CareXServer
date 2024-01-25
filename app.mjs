import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { listEvents, authorize } from './calender/listEvent.mjs'
import { ProblemMap } from "./SearchDatabase/problemMapWithSpecilization.mjs"
import { connectMongoDB } from "./connect.mjs"
import mongoose from 'mongoose';
import { addEventDetails } from "./calender/addEvent.mjs"

const app = express();


const PORT = 3001;

app.set('view engine', 'ejs');
app.set('views', path.resolve("./views"));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let doctorsDetails = [];

connectMongoDB().catch(err => console.log(err));


mongoose.connection.on('disconnected', () => {
  console.log("MongoDB is disconnected");
  process.exit(0);
})

// let events=[];

// app.get('/', (req, res) => {
//   res.redirect(`/${uuid4()}`);
// });
app.get('/', async (req, res) => {

  let mode = 'online';
  const client = await authorize();
  const events = await listEvents(client);
  console.log(events);
  res.render("index.ejs", { events: events, mode: mode });
})

//app.get('/oauthcallback',(req,res)=>{
//const authorizeCode=req.body.authorizeCode;
//setAuthorizeCode(authorizeCode);
//res.redirect('/');
//})

app.get('/problem', (req, res) => {
  res.render("problem.ejs");
})

app.get('/blog', (req, res) => {
  res.render("blog.ejs");
})

app.get('/history', (req, res) => {
  res.render("history.ejs");
})

app.post('/problem', async (req, res) => {
  const result = await ProblemMap(req.body.searchResult);
  doctorsDetails.push(result);
  //res.redirect('/doctorSuggestion');
  res.json(JSON.stringify(result));
})

app.post('/doctorSuggestion', (req, res) => {

  res.render('doctorSuggestion', { doctorsDetails: doctorsDetails });

})


app.get('/bookAppointment', (req, res) => {
  res.render('bookAppointment');
})

app.post('/bookAppointment', async (req, res) => {

  let summary = req.body.summary;
  //let location = req.body.location;
  let description = req.body.description;
  let startDateTime = req.body.description;
  //let endDateTime = req.body.endDateTime;
  //let timezone = req.body.timeZone;
  //let attendees = req.body.attendees;
  //const client = await authorize();
  addEventDetails(summary, description, startDateTime).then(() => {
    console.log("successfully event added")
  })
  res.redirect('/');
})

// app.get('/:room', (req, res) => {
//   res.render('room', { roomId: req.params.room });
// });



app.listen(PORT, () => {
  console.log(`Server is started at PORT ${PORT}`);
}) 
