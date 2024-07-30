// import cron from "node-cron";
// import moment from "moment";
// import { Doctor } from "../models/doctor.model.js";
// import { CronJob } from "../models/cronJob.model.js";
// import { createScheduleAutomatically } from "../controllers/schedule.controller.js";

// const cronJobInstances = new Map();

// export async function scheduleTask() {
//     try {
//         const doctors = await Doctor.find({ isActive: "true" }).populate(
//             "availableTime"
//         );
//         doctors.forEach((doctor) => {
//             doctor.availableTime.forEach(async (time) => {
//                 const { _id, startTime, frequencyTime } = time;
//                 await createCronJob(startTime, frequencyTime, doctor._id, _id);
//                 console.log(
//                     `Scheduled task for doctor ${doctor._id} to run every ${frequencyTime} days starting from ${startTime}.`
//                 );
//             });
//         });
//     } catch (error) {
//         console.log(error);
//     }
// }

// export const createCronJob = async (
//     startTime,
//     frequencyTime,
//     doctorId,
//     availableTimeId,
//     mode,
//     location
// ) => {
//     try {
//         const startMoment = moment(startTime, "YYYY-MM-DD HH:mm");
//         const initialDay = startMoment.date();
//         const initialMonth = startMoment.month() + 1; // Month is zero-based in moment.js
//         const initialHour = startMoment.hour();
//         const initialMinute = startMoment.minute();

//         // Create cron expressions
//         const initialCronExpression = `${initialMinute} ${initialHour} ${initialDay} ${initialMonth} *`;
//         const intervalCronExpression = `${initialMinute} ${initialHour} */${frequencyTime} * *`;

//         const jobName = `doctor_${doctorId}_availableTime_${availableTimeId}`;

//         // Check if the job already exists in memory
//         if (cronJobInstances.has(jobName)) {
//             // console.log(`Job ${jobName} already exists`);
//             return;
//         }

//         let cronJob = await CronJob.findOne({ jobName });
//         if (!cronJob) {
//             cronJob = new CronJob({
//                 doctorId,
//                 availableTimeId,
//                 cronExpression: initialCronExpression,
//                 jobName,
//             });
//             await cronJob.save();
//         }

//         // Schedule the initial cron job
//         const initialJob = cron.schedule(initialCronExpression, async () => {
//             console.log(
//                 `Running initial scheduled task for doctor ${doctorId}...`
//             );
//             const endTime = moment(startTime, "YYYY-MM-DD HH:mm")
//                 .add(2, "hours")
//                 .toISOString();
//             const schedule=await createScheduleAutomatically(
//                 startTime,
//                 endTime,
//                 mode,
//                 location,
//                 doctorId
//             );

//             // Schedule the interval cron job after the initial run
//             const intervalJob = cron.schedule(
//                 intervalCronExpression,
//                 async () => {
//                     const nextStartTime = moment().toISOString();
//                     const nextEndTime = moment(nextStartTime)
//                         .add(2, "hours")
//                         .toISOString();
//                     await createScheduleAutomatically(
//                         nextStartTime,
//                         nextEndTime,
//                         mode,
//                         location,
//                         doctorId
//                     );
//                 }
//             );

//             // Store the interval job instance in memory
//             cronJobInstances.set(`${jobName}_interval`, intervalJob);

//             // Stop the initial job after it has run once
//             initialJob.stop();
//         });

//         // Store the initial job instance in memory
//         cronJobInstances.set(jobName, initialJob);
//     } catch (error) {
//         console.log(error);
//         throw error;
//     }
// };

// export const refreshAllJobsScheduleAtMidNight = async () => {
//     cron.schedule("0 0 * * *", async () => {
//         console.log("Refreshing doctor schedules...");
//         await scheduleTask();
//     });
// };
import cron from "node-cron";
import moment from "moment";
import { Doctor } from "../models/doctor.model.js";
import { CronJob } from "../models/cronJob.model.js";
import { createScheduleAutomatically } from "../controllers/schedule.controller.js";

const cronJobInstances = new Map();

export async function scheduleTask() {
    try {
        const doctors = await Doctor.find({ isActive: "true" }).populate(
            "availableTime"
        );
        for (const doctor of doctors) {
            for (const time of doctor.availableTime) {
                const { _id, startTime, frequencyTime, mode, location } = time;
                await createCronJob(
                    startTime,
                    frequencyTime,
                    doctor._id,
                    _id,
                    mode,
                    location
                );
                
            }
        }
    } catch (error) {
        console.error("Error in scheduleTask:", error);
    }
}

export const createCronJob = async (
    startTime,
    frequencyTime,
    doctorId,
    availableTimeId,
    mode,
    location
) => {
    try {
        const startMoment = moment(startTime, "YYYY-MM-DD HH:mm");
        const scheduleMoment = startMoment.subtract(5, "days"); // Schedule 5 days before the start time
        const initialDay = scheduleMoment.date();
        const initialMonth = scheduleMoment.month() + 1; // Month is zero-based in moment.js
        const initialHour = scheduleMoment.hour();
        const initialMinute = scheduleMoment.minute();

        // Create cron expressions
        const initialCronExpression = `${initialMinute} ${initialHour} ${initialDay} ${initialMonth} *`;
        const intervalCronExpression = `${initialMinute} ${initialHour} */${frequencyTime} * *`;

        const jobName = `doctor_${doctorId}_availableTime_${availableTimeId}`;

        // Check if the job already exists in memory
        if (cronJobInstances.has(jobName)) {
            return;
        }

        let cronJob = await CronJob.findOne({ jobName });
        if (!cronJob) {
            cronJob = new CronJob({
                doctorId,
                availableTimeId,
                cronExpression: initialCronExpression,
                jobName,
            });
            await cronJob.save();
        }

        const now = moment();
        if (now.isBefore(scheduleMoment)) {
            // Schedule the initial cron job for the future schedule time
            const initialJob = cron.schedule(
                initialCronExpression,
                async () => {
                    
                    const endTime = moment(startTime, "YYYY-MM-DD HH:mm")
                        .add(2, "hours")
                        .toISOString();
                    const schedule = await createScheduleAutomatically(
                        startTime,
                        endTime,
                        mode,
                        location,
                        doctorId
                    );

                    // Schedule the interval cron job after the initial run
                    const intervalJob = cron.schedule(
                        intervalCronExpression,
                        async () => {
                            
                            const nextStartTime = moment().toISOString();
                            const nextEndTime = moment(nextStartTime)
                                .add(2, "hours")
                                .toISOString();
                            const intervalSchedule =
                                await createScheduleAutomatically(
                                    nextStartTime,
                                    nextEndTime,
                                    mode,
                                    location,
                                    doctorId
                                );
                            
                        }
                    );

                    // Store the interval job instance in memory
                    cronJobInstances.set(`${jobName}_interval`, intervalJob);

                    // Stop the initial job after it has run once
                    initialJob.stop();
                }
            );

            // Store the initial job instance in memory
            cronJobInstances.set(jobName, initialJob);
        } else {
            // Schedule the initial job immediately
            
            const endTime = now.add(2, "hours").toISOString();
            const schedule = await createScheduleAutomatically(
                now.toISOString(),
                endTime,
                mode,
                location,
                doctorId
            );
            console.log(schedule);

            // Schedule the interval cron job after the initial run
            const intervalJob = cron.schedule(
                intervalCronExpression,
                async () => {
                    
                    const nextStartTime = moment().toISOString();
                    const nextEndTime = moment(nextStartTime)
                        .add(2, "hours")
                        .toISOString();
                    const intervalSchedule = await createScheduleAutomatically(
                        nextStartTime,
                        nextEndTime,
                        mode,
                        location,
                        doctorId
                    );
                }
            );

            // Store the interval job instance in memory
            cronJobInstances.set(`${jobName}_interval`, intervalJob);
        }
    } catch (error) {
        console.error("Error in createCronJob:", error);
        throw error;
    }
};

export const refreshAllJobsScheduleAtMidNight = async () => {
    cron.schedule("0 0 * * *", async () => {
        await scheduleTask();
    });
};
