import cron from "node-cron";
import moment from "moment";
import { Doctor } from "../models/doctor.model.js";
import { CronJob } from "../models/cronJob.model.js";
import { createScheduleAutomatically } from "../controllers/schedule.controller.js";

//store cron job instances in memory to avoid duplicate jobs
const cronJobInstances = new Map();

export async function scheduleTask() {
    try {
        const doctors = await Doctor.find({ isActive: "true" }).populate(
            "availableTime"
        );
        doctors.forEach((doctor) => {
            doctor.availableTime.forEach(async (time) => {
                const { _id, startTime, frequencyTime } = time;
                await createCronJob(startTime, frequencyTime, doctor._id, _id);
                console.log(
                    `Schedule taks for doctor ${
                        doctor._id
                    } to run every ${frequencyTime} days starting from ${startMoment.format()}.`
                );
            });
        });
    } catch (error) {
        console.log(error);
    }
}
export const createCronJob = async (
    startTime,
    frequencyTime,
    doctorId,
    availableTimeId
) => {
    try {
        const startMoment = moment(startTime, "YYYY-M-D H:m");
        const initialDay = startMoment.date();
        const initialMonth = startMoment.month() + 1; // months are 0-indexed in moment.js
        const initialHour = startMoment.hour();
        const initialMinute = startMoment.minute();
        const cronExpression = `${initialMinute} ${initialHour} ${initialDay}-${
            initialDay + frequencyTime
        } */${frequencyTime} *`;

        const jobName = `doctor_${doctorId}_availableTime_${availableTimeId}`;
        console.log(jobName);

        //Check if the job already exits in memory
        if (cronJobInstances.has(jobName)) {
            console.log(`Job ${jobName} already exists`);
            return;
        }

        let cronJob = await CronJob.findOne({ jobName });
        if (!cronJob) {
            cronJob = new CronJob({
                doctorId,
                availableTimeId,
                cronExpression,
                jobName,
            });
            await cronJob.save();
        }


        // Schedule the cron job
        const job = cron.schedule(cronExpression, async () => {
            console.log(`Running scheduled task for doctor ${doctorId}...`);
            const endTime = moment(startTime, "YYYY-M-D H:m")
                .add(2, "hours")
                .toISOString();
            await createScheduleAutomatically(
                startTime,
                endTime,
                mode,
                location,
                doctorId
            );
        });

        console.log(job);


        // Store the cron job instance in memory
        cronJobInstances.set(jobName, job);
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const refreshAllJobsScheduleAtMidNight = async () => {
    cron.schedule("0 0 * * *", async () => {
        console.log("Refreshing doctor Schedules...");
        await scheduleTask();
    });
};
