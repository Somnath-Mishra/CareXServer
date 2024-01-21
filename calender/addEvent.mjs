import { google } from 'googleapis'
import fss from 'fs';
import path from 'path';
import process from 'process';
import { time } from 'console';
const fs = fss.promises;
async function addEventDetails(summary,description,startDateTime,endDateTime) {
    const TOKEN_PATH = path.join(process.cwd(), 'token.json');
    const content = await fs.readFile(TOKEN_PATH);
    const keys = JSON.parse(content);
    // const key = keys.installed || keys.web;

    const oauth2Client = new google.auth.OAuth2(keys.client_id, keys.client_secret);

    oauth2Client.setCredentials({
        // access_token: 'google access token',
        refresh_token: keys.refresh_token,
    });

    const calendar = google.calendar({ version: "v3", oauth2Client });

    const date=new Date();

    const timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone;;
    const event = {
        summary: summary,
        description: description,
        start: {
          dateTime: date('Y-m-d\TH:i:sO'),
          timeZone: timeZone,
        },
        end: {
          dateTime: date('Y-m-d\TH:i:sO'),
          timeZone: timeZone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 30 },
          ],
        },
      };

    // We make a request to Google Calendar API.
    calendar.events.insert({
        auth: oauth2Client,
        calendarId: "primary",
        resource: event,
    })
        .then((event) => console.log('Event created: %s', event.htmlLink))
        .catch((error) => console.log('Some error occured', error));

}

