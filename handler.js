import ServerlessHttp from "serverless-http";
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import { app } from "./src/app.js";
import {refreshAllJobsScheduleAtMidNight} from './src/utils/taskScheduling.js'

dotenv.config({
    path: "./.env",
});

const handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false; // ensures Lambda doesn't wait for the DB connection to close
    await connectDB();
    // refreshAllJobsScheduleAtMidNight();
    return ServerlessHttp(app)(event, context);
};

export { handler };
