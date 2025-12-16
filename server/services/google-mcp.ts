import { google } from 'googleapis';
import { authedOAuth2 } from '../auth/google.js';

export async function listCalendars() {
  const auth = authedOAuth2();
  const cal = google.calendar({ version: 'v3', auth });
  const r = await cal.calendarList.list();
  return r.data.items?.map(i => ({ id: i.id, summary: i.summary })) ?? [];
}

export async function createDoc(title: string) {
  const auth = authedOAuth2();
  const docs = google.docs({ version: 'v1', auth });
  const r = await docs.documents.create({ requestBody: { title } });
  return { id: r.data.documentId, title: r.data.title };
}

export async function createSheet(title: string) {
  const auth = authedOAuth2();
  const sheets = google.sheets({ version: 'v4', auth });
  const r = await sheets.spreadsheets.create({
    requestBody: { properties: { title } },
  });
  return { id: r.data.spreadsheetId, title: r.data.properties?.title };
}

export async function listSpreadsheets() {
  const auth = authedOAuth2();
  const drive = google.drive({ version: 'v3', auth });

  const r = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    pageSize: 5,
    fields: 'files(id,name,createdTime,modifiedTime)',
  });

  return (
    r.data.files?.map(f => ({
      id: f.id,
      name: f.name,
      createdTime: f.createdTime,
      modifiedTime: f.modifiedTime,
    })) ?? []
  );
}

export async function createCalendarEvent(params: {
  title: string;
  startISO: string;
  endISO: string;
  notes?: string;
  calendarId?: string;
}) {
  const auth = authedOAuth2();
  const cal = google.calendar({ version: 'v3', auth });
  const calendarId = params.calendarId || 'primary';
  const r = await cal.events.insert({
    calendarId,
    requestBody: {
      summary: params.title,
      description: params.notes,
      start: { dateTime: params.startISO },
      end: { dateTime: params.endISO },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 1440 },
          { method: 'popup', minutes: 60 },
        ],
      },
    },
  });
  return { id: r.data.id, calendarId };
}

// Новая упрощенная функция для создания событий
export async function createEvent(params: {
  summary: string;
  startTime: Date;
  description?: string;
  calendarId?: string;
}) {
  const auth = authedOAuth2();
  const cal = google.calendar({ version: 'v3', auth });
  const calendarId = params.calendarId || 'primary';

  // Расчет времени окончания (+1 час)
  const endTime = new Date(params.startTime);
  endTime.setHours(endTime.getHours() + 1);

  const r = await cal.events.insert({
    calendarId,
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 }, // За 24 часа
          { method: 'popup', minutes: 60 }, // За 1 час
        ],
      },
    },
  });

  return r.data.id as string;
}

// CRUD методы для работы с событиями календаря Google
export async function listCalendarEvents(params: {
  calendarId?: string;
  maxResults?: number;
  timeMin?: string;
  timeMax?: string;
}) {
  const auth = authedOAuth2();
  const cal = google.calendar({ version: 'v3', auth });
  const calendarId = params.calendarId || 'primary';

  const response = await cal.events.list({
    calendarId,
    timeMin: params.timeMin || new Date().toISOString(),
    timeMax: params.timeMax,
    maxResults: params.maxResults || 50,
    singleEvents: true,
    orderBy: 'startTime',
    fields: 'items(id,summary,description,start,end,created,updated,organizer,attendees,reminders,status,location)',
  });

  return response.data.items?.map(event => ({
    id: event.id,
    summary: event.summary,
    description: event.description,
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
    created: event.created,
    updated: event.updated,
    status: event.status,
    location: event.location,
    organizer: event.organizer?.email,
    attendees: event.attendees?.map(a => ({ email: a.email, responseStatus: a.responseStatus })) || [],
    reminders: event.reminders?.overrides || []
  })) || [];
}

export async function updateCalendarEvent(params: {
  eventId: string;
  calendarId?: string;
  summary?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  attendees?: string[];
}) {
  const auth = authedOAuth2();
  const cal = google.calendar({ version: 'v3', auth });
  const calendarId = params.calendarId || 'primary';

  const requestBody: any = {};
  
  if (params.summary) requestBody.summary = params.summary;
  if (params.description) requestBody.description = params.description;
  if (params.startTime) requestBody.start = { dateTime: params.startTime };
  if (params.endTime) requestBody.end = { dateTime: params.endTime };
  if (params.location) requestBody.location = params.location;
  if (params.attendees) {
    requestBody.attendees = params.attendees.map(email => ({ email }));
  }

  const response = await cal.events.update({
    calendarId,
    eventId: params.eventId,
    requestBody,
  });

  return {
    id: response.data.id,
    summary: response.data.summary,
    updated: response.data.updated,
  };
}

export async function deleteCalendarEvent(eventId: string, calendarId?: string) {
  const auth = authedOAuth2();
  const cal = google.calendar({ version: 'v3', auth });
  const calendar = calendarId || 'primary';

  await cal.events.delete({
    calendarId: calendar,
    eventId,
  });

  return { success: true, eventId };
}

// Метод для создания события с расширенными параметрами
export async function createAdvancedCalendarEvent(params: {
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  calendarId?: string;
  location?: string;
  attendees?: string[];
  reminders?: Array<{ method: 'email' | 'popup'; minutes: number }>;
}) {
  const auth = authedOAuth2();
  const cal = google.calendar({ version: 'v3', auth });
  const calendarId = params.calendarId || 'primary';

  const requestBody: any = {
    summary: params.summary,
    start: { dateTime: params.startTime },
    end: { dateTime: params.endTime },
  };

  if (params.description) requestBody.description = params.description;
  if (params.location) requestBody.location = params.location;
  if (params.attendees) {
    requestBody.attendees = params.attendees.map(email => ({ email }));
  }
  if (params.reminders) {
    requestBody.reminders = {
      useDefault: false,
      overrides: params.reminders,
    };
  }

  const response = await cal.events.insert({
    calendarId,
    requestBody,
  });

  return {
    id: response.data.id,
    summary: response.data.summary,
    created: response.data.created,
    calendarId,
  };
}
