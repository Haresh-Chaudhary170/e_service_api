"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoogleCalendarEvent = createGoogleCalendarEvent;
// googleCalendar.ts
const googleapis_1 = require("googleapis");
const google_auth_library_1 = require("google-auth-library");
// Initialize the Google Calendar API client
const calendar = googleapis_1.google.calendar('v3');
// Create a function to add the event to Google Calendar
async function createGoogleCalendarEvent(accessToken, summary, description, startDateTime, // ISO 8601 format (e.g., '2025-03-25T09:00:00Z')
endDateTime // ISO 8601 format (e.g., '2025-03-25T10:00:00Z')
) {
    try {
        // Initialize OAuth2 client with the user's credentials (access token)
        const oauth2Client = new google_auth_library_1.OAuth2Client();
        // Set the user's credentials (access token & refresh token)
        oauth2Client.setCredentials({
            access_token: accessToken,
        });
        // Use the access token to authorize the Google Calendar API
        googleapis_1.google.options({
            auth: oauth2Client,
        });
        // Prepare the event details
        const event = {
            summary,
            description,
            start: {
                dateTime: startDateTime,
                timeZone: 'UTC',
            },
            end: {
                dateTime: endDateTime,
                timeZone: 'UTC',
            },
        };
        // Insert the event into the user's Google Calendar
        await calendar.events.insert({
            calendarId: 'primary', // Use 'primary' to add to the user's main calendar
            requestBody: event,
        });
        console.log('Google Calendar event created successfully');
    }
    catch (error) {
        console.error('Error creating Google Calendar event:', error);
        throw new Error('Failed to create Google Calendar event');
    }
}
