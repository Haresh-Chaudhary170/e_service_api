// googleCalendar.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Initialize the Google Calendar API client
const calendar = google.calendar('v3');

// Create a function to add the event to Google Calendar
async function createGoogleCalendarEvent(
    accessToken: string,
    summary: string,
    description: string,
    startDateTime: string, // ISO 8601 format (e.g., '2025-03-25T09:00:00Z')
    endDateTime: string ,
    timezone: string    // ISO 8601 format (e.g., '2025-03-25T10:00:00Z')
): Promise<void> {
    try {
        // Initialize OAuth2 client with the user's credentials (access token)
        const oauth2Client = new OAuth2Client();

        // Set the user's credentials (access token & refresh token)
        oauth2Client.setCredentials({
            access_token: accessToken,
        });

        // Use the access token to authorize the Google Calendar API
        google.options({
            auth: oauth2Client,
        });

        // Prepare the event details
        const event = {
            summary,
            description,
            start: {
                dateTime: startDateTime,
                timeZone: timezone,
            },
            end: {
                dateTime: endDateTime,
                timeZone: timezone,
            },
        };

        // Insert the event into the user's Google Calendar
        await calendar.events.insert({
            calendarId: 'primary', // Use 'primary' to add to the user's main calendar
            requestBody: event,
        });

        console.log('Google Calendar event created successfully');
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        throw new Error('Failed to create Google Calendar event');
    }
}

export { createGoogleCalendarEvent };
