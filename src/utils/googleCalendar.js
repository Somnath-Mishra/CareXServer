import fs from "fs";
import path from "path";
import process from "process";
import google from "googleapis";
import authenticate from "@google-cloud/local-auth";
class GoogleCalendar {
    SCOPES = ["https://www.googleapis.com/auth/calendar"];
    auth;
    client;
    calendar;
    TOKEN_PATH = path.join(process.cwd(), "token.json");
    CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
    constructor() {}

    async loadSavedCredentialsIfExist() {
        try {
            const content = await fs.readFile(this.TOKEN_PATH);
            const credentials = JSON.parse(content);
            this.client = google.Auth.auth.fromJSON(credentials);
        } catch (err) {
            return null;
        }
    }

    async saveCredentials(client) {
        try {
            const content = await fs.readFile(this.CREDENTIALS_PATH);
            const keys = JSON.parse(content);
            const key = keys.installed || keys.web;
            const payload = JSON.stringify({
                type: "authorized_user",
                client_id: key.client_id,
                client_secret: key.client_secret,
                refresh_token: client.credentials.refresh_token,
            });
            await fs.writeFile(this.TOKEN_PATH, payload);
        } catch (err) {
            console.log(err);
        }
    }

    async authorize() {
        try {
            if (this.client) return this.client;
            await this.loadSavedCredentialsIfExist();
            this.client = await authenticate({
                keyfilePath: this.CREDENTIALS_PATH,
                scopes: this.SCOPES,
            });
            if (this.client.credentials) {
                await this.saveCredentials(this.client);
            }
            auth = this.client;
        } catch (err) {
            console.log(err);
        }
    }

    setCalendar() {
        this.calendar = google.calendar({ version: "v3", auth: this.auth });
    }

    //listing next 10 events
    async listEvents() {
        if (!this.auth) await this.authorize();
        if (!this.calendar) {
            this.setCalendar();
        }
        const res = await this.calendar.events.list({
            calendarId: "primary",
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: "startTime",
        });
        const events = res.data.items;
        if (!events || events.length === 0) {
            return null;
        }
        return events;
    }
    //creating an event
    async createEvent(event) {
        try {
            if (!this.auth) await this.authorize();
            if (!this.calendar) {
                this.setCalendar();
            }
            const res = await this.calendar.events.insert({
                auth: this.auth,
                calendarId: "primary",
                resource: event,
            });
            return res.data;
        } catch (error) {
            console.log(
                "There was an error contacting the Calendar service: " + error
            );
            return;
        }
    }
    async bookAnAppointmentInCalendar(
        summary = "Appointment with doctor",
        description = "This is an appointment with doctor",
        year,
        month,
        day,
        hour,
        minute,
        second,
        timeZone,
        country,
        patientEmail,
        doctorEmail
    ) {
        try {
            const isoStringStartDateTime = new Date(
                year,
                month - 1,
                day,
                hour,
                minute,
                second
            ).toISOString();
            const isoStringEndDateTime = new Date(
                year,
                month - 1,
                day,
                hour,
                minute + 10,
                second
            ).toISOString();
            const event = {
                summary: summary,
                location: country,
                description: description,
                start: {
                    dateTime: isoStringStartDateTime,
                    timeZone: timeZone,
                },
                end: {
                    dateTime: isoStringEndDateTime,
                    timeZone: timeZone,
                },

                attendees: [doctorEmail, patientEmail],
                reminders: {
                    useDefault: true,
                    overrides: [
                        { method: "email", minutes: 24 * 60 },
                        { method: "popup", minutes: 10 },
                    ],
                },
            };
            return await this.createEvent(event);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export const googleCalendar = new GoogleCalendar();
