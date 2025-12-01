import { dbWrite } from '../db.js';
import { followupTasks } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { createAdvancedCalendarEvent } from './google-mcp.js';

interface SchedulePaymentReminderParams {
    orderId: string;
    userId: string;
    dueDate: Date;
    amount?: string;
}

interface ScheduleDeliveryReminderParams {
    orderId: string;
    userId: string;
    deliveryDate: Date;
    supplier?: string;
}

interface ScheduleFollowupTaskParams {
    userId: string;
    type: string;
    relatedEntity?: string;
    entityId?: string;
    dueDate: Date;
    title: string;
    notes?: string;
}

/**
 * Schedule a payment reminder for an order
 * Creates a followup task and optionally syncs to Google Calendar
 */
export async function schedulePaymentReminder(
    params: SchedulePaymentReminderParams
): Promise<string> {
    const { orderId, userId, dueDate, amount } = params;

    const title = `Payment Due${amount ? `: $${amount}` : ''}`;
    const notes = `Payment reminder for order ${orderId}`;

    // Insert into followup_tasks table
    const [task] = await dbWrite
        .insert(followupTasks)
        .values({
            userId,
            type: 'payment',
            relatedEntity: 'order',
            entityId: orderId,
            dueDate,
            title,
            notes,
            status: 'pending',
        })
        .returning();

    // Try to create Google Calendar event
    try {
        const endDate = new Date(dueDate);
        endDate.setHours(endDate.getHours() + 1);

        const calendarEvent = await createAdvancedCalendarEvent({
            summary: title,
            description: notes,
            startTime: dueDate.toISOString(),
            endTime: endDate.toISOString(),
        });

        // Update task with Google event ID
        if (calendarEvent?.id) {
            await dbWrite
                .update(followupTasks)
                .set({ googleEventId: calendarEvent.id })
                .where(eq(followupTasks.id, task.id));
        }
    } catch (error) {
        console.warn('Failed to sync payment reminder to Google Calendar:', error);
        // Continue even if Google Calendar sync fails
    }

    return task.id;
}

/**
 * Schedule a delivery reminder for an order
 * Creates a followup task and optionally syncs to Google Calendar
 */
export async function scheduleDeliveryReminder(
    params: ScheduleDeliveryReminderParams
): Promise<string> {
    const { orderId, userId, deliveryDate, supplier } = params;

    const title = `Delivery Expected${supplier ? ` from ${supplier}` : ''}`;
    const notes = `Delivery reminder for order ${orderId}`;

    // Insert into followup_tasks table
    const [task] = await dbWrite
        .insert(followupTasks)
        .values({
            userId,
            type: 'delivery',
            relatedEntity: 'order',
            entityId: orderId,
            dueDate: deliveryDate,
            title,
            notes,
            status: 'pending',
        })
        .returning();

    // Try to create Google Calendar event
    try {
        const endDate = new Date(deliveryDate);
        endDate.setHours(endDate.getHours() + 1);

        const calendarEvent = await createAdvancedCalendarEvent({
            summary: title,
            description: notes,
            startTime: deliveryDate.toISOString(),
            endTime: endDate.toISOString(),
        });

        // Update task with Google event ID
        if (calendarEvent?.id) {
            await dbWrite
                .update(followupTasks)
                .set({ googleEventId: calendarEvent.id })
                .where(eq(followupTasks.id, task.id));
        }
    } catch (error) {
        console.warn('Failed to sync delivery reminder to Google Calendar:', error);
        // Continue even if Google Calendar sync fails
    }

    return task.id;
}

/**
 * Schedule a generic followup task
 * Creates a followup task and optionally syncs to Google Calendar
 */
export async function scheduleFollowupTask(
    params: ScheduleFollowupTaskParams
): Promise<string> {
    const { userId, type, relatedEntity, entityId, dueDate, title, notes } = params;

    // Insert into followup_tasks table
    const [task] = await dbWrite
        .insert(followupTasks)
        .values({
            userId,
            type,
            relatedEntity,
            entityId,
            dueDate,
            title,
            notes,
            status: 'pending',
        })
        .returning();

    // Try to create Google Calendar event
    try {
        const endDate = new Date(dueDate);
        endDate.setHours(endDate.getHours() + 1);

        const calendarEvent = await createAdvancedCalendarEvent({
            summary: title,
            description: notes || '',
            startTime: dueDate.toISOString(),
            endTime: endDate.toISOString(),
        });

        // Update task with Google event ID
        if (calendarEvent?.id) {
            await dbWrite
                .update(followupTasks)
                .set({ googleEventId: calendarEvent.id })
                .where(eq(followupTasks.id, task.id));
        }
    } catch (error) {
        console.warn('Failed to sync followup task to Google Calendar:', error);
        // Continue even if Google Calendar sync fails
    }

    return task.id;
}
