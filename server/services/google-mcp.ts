import { google } from "googleapis";
import { authedOAuth2 } from "../auth/google";

export async function listCalendars(){
  const auth = authedOAuth2();
  const cal = google.calendar({ version: "v3", auth });
  const r = await cal.calendarList.list();
  return r.data.items?.map(i=>({ id:i.id, summary:i.summary })) ?? [];
}

export async function createDoc(title:string){
  const auth = authedOAuth2();
  const docs = google.docs({ version: "v1", auth });
  const r = await docs.documents.create({ requestBody: { title } });
  return { id: r.data.documentId, title: r.data.title };
}

export async function createSheet(title:string){
  const auth = authedOAuth2();
  const sheets = google.sheets({ version: "v4", auth });
  const r = await sheets.spreadsheets.create({ requestBody: { properties: { title } } });
  return { id: r.data.spreadsheetId, title: r.data.properties?.title };
}

export async function listSpreadsheets() {
  const auth = authedOAuth2();
  const drive = google.drive({ version: "v3", auth });
  
  const r = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    pageSize: 5,
    fields: "files(id,name,createdTime,modifiedTime)"
  });
  
  return r.data.files?.map(f => ({
    id: f.id,
    name: f.name,
    createdTime: f.createdTime,
    modifiedTime: f.modifiedTime
  })) ?? [];
}

export async function createCalendarEvent(params:{ title:string; startISO:string; endISO:string; notes?:string; calendarId?:string }) {
  const auth = authedOAuth2();
  const cal = google.calendar({ version:"v3", auth });
  const calendarId = params.calendarId || "primary";
  const r = await cal.events.insert({
    calendarId,
    requestBody: {
      summary: params.title,
      description: params.notes,
      start: { dateTime: params.startISO },
      end: { dateTime: params.endISO },
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: 1440 }, { method: "popup", minutes: 60 }]
      }
    }
  });
  return { id: r.data.id, calendarId };
}