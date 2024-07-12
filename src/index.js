import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js"
import conf from "./conf/conf.js";

dotenv.config({
    path: './.env'
});


connectDB()
    .then(() => {
        app.on('error', (error) => {
            console.log(`ERROR: ${error}`);
        });
        const PORT = conf.serverPort || 9000;
        app.listen(PORT, () => {
            console.log(`⚙️ Server is running at port : ${PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!!", err);
    })