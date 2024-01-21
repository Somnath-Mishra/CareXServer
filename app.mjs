import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { listEvents, authorize, addEventDetails } from './calender/listEvent.mjs'
import { ProblemMap } from './SearchDatabase/problemMapWithSpecilization.mjs'
const app = express();

const PORT = 3001;

let doctorsDetails = [];

function isLoggedIn(req, res, next) {


  next();
}

app.use(cookieParser());
app.use(isLoggedIn());

mongoose.connect("mongodb://127.0.0.1:27017/DoctorsDB")

app.set('view engine', 'ejs');
app.set('views', path.resolve("./views"));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.get('/', async (req, res) => {
  let mode = 'online';
  const client = await authorize();
  const events = await listEvents(client);
  console.log(events);
  res.render("index.ejs", { events: events, mode: mode });
})

app.get('/problem', (req, res) => {
  res.render("problem.ejs");
})

app.get('/blog', (req, res) => {
  res.render("blog.ejs");
})

app.get('/history', (req, res) => {
  res.render("history.ejs");
})

app.get('/appointment', async (req, res) => {

  let mode = 'online';
  const client = await authorize();
  const events = await listEvents(client);
  console.log(events);
  res.render('schedule', { events: events, mode: mode });
})

app.get('/bookAppointment', (req, res) => {
  res.render('bookAppointment');
})

app.post('/bookAppointment', async (req, res) => {

  let summary = req.body.summary;
  let description = req.body.description;
  let startDateTime = req.body.startDateTime;
  addEventDetails(summary, description, startDateTime)
  res.redirect('/appointment');
})

app.post('/problem', (req, res) => {
  doctorsDetails.push(ProblemMap(req.body.search));
  res.redirect('/doctorSuggestion');
})

app.post('/doctorSuggestion', (req, res) => {

  res.render('doctorSuggestion', { doctorsDetails: doctorsDetails });

})


app.listen(PORT, () => {
  console.log(`Server is started at PORT ${PORT}`);
}) 
