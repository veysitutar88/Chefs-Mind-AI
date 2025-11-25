import fs from 'fs';
import path from 'path';

interface SidebarActionLog {
    userId: string;
    action: string;
    sessionId?: string;
    result?: any;
    timestamp?: Date;
}

/**
 * Log sidebar action to JSON file
 */
export async function logSidebarAction(data: SidebarActionLog): Promise<void> {
    try {
        const logDir = path.join(process.cwd(), 'logs', 'sidebar');

        // Ensure directory exists
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const date = new Date().toISOString().split('T')[0];
        const logFile = path.join(logDir, `sidebar-actions-${date}.json`);

        const logEntry = {
            timestamp: new Date().toISOString(),
            userId: data.userId,
            action: data.action,
            sessionId: data.sessionId,
            result: data.result,
        };

        // Append to log file (one JSON object per line)
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

    } catch (error) {
        console.error('Failed to log sidebar action:', error);
        // Don't throw - logging failures shouldn't break the app
    }
}
