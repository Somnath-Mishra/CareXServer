import ServerlessHttp from "serverless-http";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
// import conf from "./conf/conf.js";
import { refreshAllJobsScheduleAtMidNight } from "./utils/taskScheduling.js";

dotenv.config({
    path: "./.env",
});

const handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false; // ensures Lambda doesn't wait for the DB connection to close
    await connectDB();
    refreshAllJobsScheduleAtMidNight();
    return ServerlessHttp(app)(event, context);
};

export { handler };
