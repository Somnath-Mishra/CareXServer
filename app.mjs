import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import {listEvents,authorize,addEventDetails} from './calender/listEvent.mjs'


const app = express();

const PORT =3001;

app.set('view engine', 'ejs');
app.set('views', path.resolve("./views"));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// let events=[];

// app.get('/', (req, res) => {
//   res.redirect(`/${uuid4()}`);
// });

app.get('/', (req, res) => {
    res.render("index.ejs");
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

  let summary=req.body.summary;
  let location=req.body.location;
  let description=req.body.description;
  let startDateTime=req.body.description;
  let endDateTime=req.body.endDateTime;
  let timezone=req.body.timeZone;
  let attendees=req.body.attendees;
  const client=await authorize();
  addEventDetails(summary,location,description,startDateTime,endDateTime,timezone,attendees,client)
  res.redirect('/appointment');
})

// app.get('/:room', (req, res) => {
//   res.render('room', { roomId: req.params.room });
// });



app.listen(PORT, () => {
  console.log(`Server is started at PORT ${PORT}`);
}) 
