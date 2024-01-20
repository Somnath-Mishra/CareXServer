import { GoogleApis } from "googleapis";

function addEventDetails(summary, location, description, startDateTime, endDateTime, timezone, attendees,client) {
    const event = {
        'summary': summary,
        'location': location,
        'description': description,
        'start': {
            'dateTime': startDateTime,
            'timeZone': timezone
        },
        'end': {
            'dateTime': endDateTime,
            'timeZone': timezone
        },
        
        'attendees': attendees,
        'reminders': {
            'useDefault': true,
            'overrides': [
                { 'method': 'email', 'minutes': 24 * 60 },
                { 'method': 'popup', 'minutes': 10 }
            ]
        },
        'location':location
    };
    const request =GoogleApis.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
    });   
    request.execute(function (event) {
        appendPre('Event created: ' + event.htmlLink);
    }); 
}




export {addEventDetails};



