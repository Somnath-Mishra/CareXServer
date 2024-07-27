
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
import doctorRouter from "./routes/doctor.routes.js";
import adminRouter from "./routes/admin.routes.js"
import avaliableTimeRouter from "./routes/avaliableTime.routes.js";
import healthRouter from "./routes/health.routes.js";

// Routes declaration
app.use('/api/v1/user', userRouter);
app.use('/api/v1/appointment',appointmentRouter);
app.use("/api/v1/payment",paymentRouter);
app.use("/api/v1/schedule",scheduleRouter);
app.use("/api/v1/doctor", doctorRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/avaliableTime", avaliableTimeRouter);
app.use("/api/v1/health", healthRouter);

export { app };
