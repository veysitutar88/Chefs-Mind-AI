import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

// MCP Server для Google сервисов
export class GoogleMCPService {
  private auth: GoogleAuth;
  private calendar: any;
  private docs: any;
  private sheets: any;

  constructor() {
    this.auth = new GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/spreadsheets'
      ]
    });
  }

  async initialize() {
    try {
      this.calendar = google.calendar({ version: 'v3', auth: this.auth });
      this.docs = google.docs({ version: 'v1', auth: this.auth });
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      console.log('✅ Google MCP Services initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google services:', error);
      throw error;
    }
  }

  // Google Calendar операции
  async createCalendarEvent(eventData: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    attendees?: Array<{ email: string }>;
  }) {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventData
      });
      
      return {
        success: true,
        eventId: response.data.id,
        eventLink: response.data.htmlLink,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async listCalendarEvents(timeMin?: string, timeMax?: string) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return {
        success: true,
        events: response.data.items || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Google Docs операции
  async createDocument(title: string, content?: string) {
    try {
      const doc = await this.docs.documents.create({
        requestBody: {
          title: title
        }
      });

      if (content) {
        await this.docs.documents.batchUpdate({
          documentId: doc.data.documentId,
          requestBody: {
            requests: [
              {
                insertText: {
                  location: {
                    index: 1
                  },
                  text: content
                }
              }
            ]
          }
        });
      }

      return {
        success: true,
        documentId: doc.data.documentId,
        documentUrl: `https://docs.google.com/document/d/${doc.data.documentId}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateDocument(documentId: string, content: string) {
    try {
      await this.docs.documents.batchUpdate({
        documentId: documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: {
                  index: 1
                },
                text: content
              }
            }
          ]
        }
      });

      return {
        success: true,
        documentId: documentId,
        updated: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getDocumentContent(documentId: string) {
    try {
      const response = await this.docs.documents.get({
        documentId: documentId
      });

      const content = response.data.body?.content || [];
      let text = '';

      content.forEach((element: any) => {
        if (element.paragraph) {
          element.paragraph.elements?.forEach((elem: any) => {
            if (elem.textRun) {
              text += elem.textRun.content;
            }
          });
        }
      });

      return {
        success: true,
        content: text.trim(),
        documentId: documentId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Google Sheets операции
  async createSpreadsheet(title: string, headers?: string[]) {
    try {
      const spreadsheet = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: title
          },
          sheets: headers ? [{
            properties: {
              title: 'Лист1'
            },
            data: [{
              startRow: 1,
              startColumn: 1,
              rowData: [{
                values: headers.map(header => ({ userEnteredValue: { stringValue: header } }))
              }]
            }]
          }] : undefined
        }
      });

      return {
        success: true,
        spreadsheetId: spreadsheet.data.spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheet.data.spreadsheetId}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateSheetData(spreadsheetId: string, range: string, values: any[][]) {
    try {
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: values
        }
      });

      return {
        success: true,
        updatedRows: response.data.updatedRows,
        updatedColumns: response.data.updatedColumns,
        updatedCells: response.data.updatedCells
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getSheetData(spreadsheetId: string, range?: string) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range || 'A:Z'
      });

      return {
        success: true,
        values: response.data.values || [],
        range: response.data.range
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async addSheetRow(spreadsheetId: string, values: any[], sheetName?: string) {
    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: sheetName ? `${sheetName}!A:Z` : 'A:Z',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [values]
        }
      });

      return {
        success: true,
        updatedRange: response.data.updates?.updatedRange,
        updatedRows: response.data.updates?.updatedRows
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Singleton экземпляр
let googleMCPInstance: GoogleMCPService | null = null;

export async function getGoogleMCPService(): Promise<GoogleMCPService> {
  if (!googleMCPInstance) {
    googleMCPInstance = new GoogleMCPService();
    await googleMCPInstance.initialize();
  }
  return googleMCPInstance;
}

// MCP инструменты для агентов
export const googleMCPTools = {
  // Calendar инструменты
  create_event: {
    name: 'create_calendar_event',
    description: 'Создать событие в Google Calendar',
    parameters: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'Название события' },
        description: { type: 'string', description: 'Описание события' },
        start: { 
          type: 'object',
          properties: {
            dateTime: { type: 'string', description: 'Дата и время начала в ISO формате' },
            timeZone: { type: 'string', description: 'Часовой пояс' }
          }
        },
        end: { 
          type: 'object',
          properties: {
            dateTime: { type: 'string', description: 'Дата и время окончания в ISO формате' },
            timeZone: { type: 'string', description: 'Часовой пояс' }
          }
        }
      },
      required: ['summary', 'start', 'end']
    }
  },

  // Docs инструменты
  create_document: {
    name: 'create_document',
    description: 'Создать документ Google Docs',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Название документа' },
        content: { type: 'string', description: 'Содержимое документа' }
      },
      required: ['title']
    }
  },

  // Sheets инструменты
  create_spreadsheet: {
    name: 'create_spreadsheet',
    description: 'Создать таблицу Google Sheets',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Название таблицы' },
        headers: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Заголовки колонок' 
        }
      },
      required: ['title']
    }
  },

  update_sheet_data: {
    name: 'update_sheet_data',
    description: 'Обновить данные в таблице Google Sheets',
    parameters: {
      type: 'object',
      properties: {
        spreadsheetId: { type: 'string', description: 'ID таблицы' },
        range: { type: 'string', description: 'Диапазон ячеек (например, A1:C10)' },
        values: { 
          type: 'array',
          items: { type: 'array' },
          description: 'Данные для обновления'
        }
      },
      required: ['spreadsheetId', 'values']
    }
  }
};