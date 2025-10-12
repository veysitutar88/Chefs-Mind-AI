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
