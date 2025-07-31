import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js"
import conf from "./conf/conf.js";
import { refreshAllJobsScheduleAtMidNight } from "./utils/taskScheduling.js";

dotenv.config({
    path: './.env'
});


connectDB()
    .then(() => {
        app.on('error', (error) => {
            console.log(`ERROR: ${error}`);
        });
        const PORT = conf.serverPort || 8080;
        app.listen(PORT, () => {
            console.log(`⚙️ Server is running at port : ${PORT}`);
        })
        refreshAllJobsScheduleAtMidNight();
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!!", err);
    })

