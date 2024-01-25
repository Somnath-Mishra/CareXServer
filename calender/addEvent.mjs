import { google } from 'googleapis';
import * as fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { auth } from 'google-auth-library';

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const content = await fs.readFile(CREDENTIALS_PATH);
const keys = JSON.parse(content);

// Assuming 'web' is the appropriate property for your credentials JSON
const webCredentials = keys.web || keys.installed;
const CLIENT_ID = webCredentials.client_id;
const CLIENT_SECRET = webCredentials.client_secret;
const REDIRECT_URL = webCredentials.redirect_uris[0]; // Assuming redirect_uris is an array

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

// The authorization URL to redirect the user to
console.log('Authorize this app by visiting this URL:', url);

// Assuming you retrieve the authorization code from the redirect URL
// Once the user grants permissions, Google will redirect to your redirect URL with a code parameter
// Extract the code from the URL and use it in the next step
let code="4/0AfJohXmJclb6RxlG-DJ9n-W6h-BO4D4lmm_xBjjc-KQVTbKtt9oi7S0NRAoSKhH4EjosLQ";


// const setAuthorizeCode=((authorizeCode)=>{
//   code=authorizeCode;

// }).then(()=>{
  async function getAccessTokenAndSetCredentials() {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
  
      // Save the refresh token to token.json
      if (tokens.refresh_token) {
        await fs.writeFile(TOKEN_PATH, tokens.refresh_token);
      }
  
      console.log('Access token:', tokens.access_token);
      console.log('Refresh token:', tokens.refresh_token);
    } catch (error) {
      console.error('Error getting access token:', error.message);
    }
  }    
// })



// Uncomment the following line when you have the authorization code
// getAccessTokenAndSetCredentials();

async function addEventDetails(summary, description, startDateTime) {
  try {
    // Uncomment the following line when you have the access token
    await getAccessTokenAndSetCredentials();

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: summary,
      description: description,
      start: {
        dateTime: new Date(startDateTime).toISOString(),
        timeZone: 'UTC', // Set your desired time zone or remove this line for default
      },
      end: {
        dateTime: new Date(startDateTime).toISOString(),
        timeZone: 'UTC', // Set your desired time zone or remove this line for default
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
      resource: event,
    });

    console.log('Event created: %s', response.data.htmlLink);
  } catch (error) {
    console.log('Some error occurred', error.message);
  }
}

export { addEventDetails };
