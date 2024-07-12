
import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import conf from './conf/conf.js';


const app = express();

app.use(cors({
    origin: conf.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({
    limit: "64kb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "64kb"
}));
app.use(express.static("public"));
app.use(cookieParser());

// Routes import
import userRouter from './routes/user.routes.js';
import appointmentRouter from './routes/appointment.routes.js';
import paymentRouter from './routes/payment.routes.js';
import scheduleRouter from './routes/schedule.routes.js'

// Routes declaration
app.use('/api/v1/user', userRouter);
app.use('/api/v1/appointment',appointmentRouter);
app.use("/api/v1/payment",paymentRouter);
app.use("/api/v1/schedule",scheduleRouter);


export { app };
