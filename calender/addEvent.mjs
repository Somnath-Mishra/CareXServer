import { google } from 'googleapis';
import * as fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { auth } from 'google-auth-library';
import { addMinutesToTime, getCurrentTimeZone, convertToISOStringWithOffset } from './dateFormate.mjs'
import { authorize } from "./listEvent.mjs"
import { authenticate } from '@google-cloud/local-auth';
import dotenv from 'dotenv';

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const content = await fs.readFile(CREDENTIALS_PATH);
const keys = JSON.parse(content);

// Assuming 'web' is the appropriate property for your credentials JSON
const webCredentials = keys.web || keys.installed;
const API_KEY = process.env.API_KEY;
const CLIENT_ID = webCredentials.client_id;
const CLIENT_SECRET = webCredentials.client_secret;
const REDIRECT_URL = webCredentials.redirect_uris[0]; // Assuming redirect_uris is an array
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL,
  REFRESH_TOKEN,
  API_KEY,
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});


async function getAccessTokenAndSetCredentials() {
  try {

    // Assuming you have the authorization code stored in a variable 'code'
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials({
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      api_key: API_KEY
    });

    // Save the refresh token to token.json
    if (tokens.refresh_token) {
      await fs.writeFile(TOKEN_PATH, tokens.refresh_token);



    console.log('Access token:', tokens.access_token);
    console.log('Refresh token:', tokens.refresh_token);
  } catch (error) {
    console.error('Error getting access token:', error.message);
  }
}
// })



// Uncomment the following line when you have the authorization code
// getAccessTokenAndSetCredentials();

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
async function addEventDetails(summary, description, startDate, startTime, oAuth2Client) {
  try {
    // Uncomment the following line when you have the access token
    //await getAccessTokenAndSetCredentials();
    oAuth2Client.setCredentials({
      refresh_token: process.env.refresh_token,
    })
    const calendar = google.calendar({ version: 'v3', client: oAuth2Client });

    if (!startDate || !startTime) {
      throw new Error("Missing required input: startDate or startTime");
    }

    const startDateTime = "2024-02-26T09:00:00+05:30" || convertToISOStringWithOffset(startDate.toString(), startTime.toString());
    const endDateTime = "2024-02-26T17:00:00+05:30" || addMinutesToTime(startTime, 30);

    const currentTimeZone = getCurrentTimeZone();

    console.log(startTime);
    console.log(startDate);
    console.log(currentTimeZone);

    const event = {
      summary: summary,
      description: description,
      start: {
        dateTime: startDateTime,
        timeZone: currentTimeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: currentTimeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      auth: oAuth2Client,
      requestBody: event,
    });

    console.log('Event created: %s', response?.data);
  } catch (error) {
    console.log('Some error occurred', error.message);
  }
}

export { addEventDetails, authUrl, oAuth2Client };
