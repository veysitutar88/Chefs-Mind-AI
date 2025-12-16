import express from 'express';
import { z } from 'zod';
import { dbRead } from '../db.js';
import { messages, chatSessions } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticate } from '../middleware/jwtAuth.js';
import { requireRole } from '../middleware/rbac.js';
import { logSidebarAction } from '../utils/sidebar-logger.util.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireRole(['chef', 'accountant', 'admin']));

// Validation schemas
const summarizeChatSchema = z.object({
    sessionId: z.string().uuid(),
    agentId: z.string().optional(),
});

const exportChatSchema = z.object({
    sessionId: z.string().uuid(),
    format: z.enum(['md', 'json']),
});

const findIngredientsSchema = z.object({
    sessionId: z.string().uuid(),
});

const costBreakdownSchema = z.object({
    sessionId: z.string().uuid(),
});

const reasoningTreeSchema = z.object({
    sessionId: z.string().uuid(),
});

// Agent-to-Tools mapping
const AGENT_TOOLS: Record<string, string[]> = {
    sous_chef: ['summarize_chat', 'export_chat', 'find_ingredients'],
    gastro_count: ['summarize_chat', 'export_chat', 'cost_breakdown'],
    gastro_mind: ['summarize_chat', 'export_chat', 'reasoning_tree'],
    food_frame: ['summarize_chat', 'export_chat'],
};

/**
 * GET /api/tools/available
 * Returns available tools for a given agent
 */
router.get('/available', async (req, res) => {
    try {
        const agentId = req.query.agentId as string;

        if (!agentId) {
            return res.status(400).json({ error: 'agentId is required' });
        }

        const tools = AGENT_TOOLS[agentId] || ['summarize_chat', 'export_chat'];

        const toolDefinitions = tools.map(toolId => ({
            id: toolId,
            name: toolId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: getToolDescription(toolId),
            agent: agentId,
        }));

        res.json({ tools: toolDefinitions });

    } catch (error) {
        console.error('Get available tools error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/tools/summarize-chat
 * Summarize a chat session using LLM
 */
router.post('/summarize-chat', async (req, res) => {
    try {
        const params = summarizeChatSchema.parse(req.body);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { sessionId } = params;

        // Verify session belongs to user
        const [session] = await dbRead
            .select()
            .from(chatSessions)
            .where(and(
                eq(chatSessions.id, sessionId),
                eq(chatSessions.userId, userId)
            ));

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Get all messages from session
        const sessionMessages = await dbRead
            .select()
            .from(messages)
            .where(eq(messages.sessionId, sessionId))
            .orderBy(messages.createdAt);

        if (sessionMessages.length === 0) {
            return res.json({
                summary: 'No messages in this session yet.',
                keyPoints: [],
            });
        }

        // Create summary (placeholder - in production would use LLM)
        const messageCount = sessionMessages.length;
        const userMessages = sessionMessages.filter(m => m.role === 'user');
        const assistantMessages = sessionMessages.filter(m => m.role === 'assistant');

        const summary = `This conversation has ${messageCount} messages (${userMessages.length} from user, ${assistantMessages.length} from assistant) about ${session.agentType}.`;

        const keyPoints = [
            `Agent: ${session.agentType}`,
            `Total messages: ${messageCount}`,
            `Session started: ${session.createdAt}`,
        ];

        // Log action
        await logSidebarAction({
            userId,
            action: 'summarize_chat',
            sessionId,
            result: { summary, keyPoints },
        });

        res.json({ summary, keyPoints });

    } catch (error) {
        console.error('Summarize chat error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid request',
                details: error.errors,
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/tools/export-chat
 * Export chat session in MD or JSON format
 */
router.post('/export-chat', async (req, res) => {
    try {
        const params = exportChatSchema.parse(req.body);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { sessionId, format } = params;

        // Verify session belongs to user
        const [session] = await dbRead
            .select()
            .from(chatSessions)
            .where(and(
                eq(chatSessions.id, sessionId),
                eq(chatSessions.userId, userId)
            ));

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Get all messages
        const sessionMessages = await dbRead
            .select()
            .from(messages)
            .where(eq(messages.sessionId, sessionId))
            .orderBy(messages.createdAt);

        let content = '';
        const filename = `chat-${sessionId}.${format}`;

        if (format === 'json') {
            content = JSON.stringify({
                session,
                messages: sessionMessages,
                exported: new Date().toISOString(),
            }, null, 2);
        } else {
            // Markdown format
            content = `# Chat Export: ${session.title || 'Untitled'}\n\n`;
            content += `**Agent:** ${session.agentType}\n`;
            content += `**Created:** ${session.createdAt}\n\n`;
            content += `---\n\n`;

            for (const msg of sessionMessages) {
                const time = msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Unknown time';
                content += `### ${msg.role === 'user' ? '👤 User' : '🤖 Assistant'} (${time})\n\n`;
                content += `${msg.content}\n\n`;
            }
        }

        // Log action
        await logSidebarAction({
            userId,
            action: 'export_chat',
            sessionId,
            result: { format, filename },
        });

        res.json({ content, filename });

    } catch (error) {
        console.error('Export chat error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid request',
                details: error.errors,
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/tools/find-ingredients
 * Extract ingredients from chat (SousChef only)
 */
router.post('/find-ingredients', async (req, res) => {
    try {
        const params = findIngredientsSchema.parse(req.body);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { sessionId } = params;

        // Verify session belongs to user and is SousChef
        const [session] = await dbRead
            .select()
            .from(chatSessions)
            .where(and(
                eq(chatSessions.id, sessionId),
                eq(chatSessions.userId, userId)
            ));

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.agentType !== 'sous_chef') {
            return res.status(403).json({
                error: 'This tool is only available for SousChef sessions'
            });
        }

        // Get messages
        const sessionMessages = await dbRead
            .select()
            .from(messages)
            .where(eq(messages.sessionId, sessionId));

        // Placeholder: Extract ingredients (in production would use NLP/LLM)
        const ingredients: any[] = [];

        // Simple keyword extraction
        const foodKeywords = ['tomato', 'onion', 'garlic', 'olive oil', 'salt', 'pepper',
            'chicken', 'beef', 'flour', 'sugar', 'butter', 'milk', 'egg'];

        for (const msg of sessionMessages) {
            const content = msg.content.toLowerCase();
            for (const keyword of foodKeywords) {
                if (content.includes(keyword)) {
                    ingredients.push({
                        name: keyword,
                        mentioned: true,
                        context: msg.content.substring(0, 100),
                    });
                }
            }
        }

        // Remove duplicates
        const uniqueIngredients = Array.from(
            new Map(ingredients.map(i => [i.name, i])).values()
        );

        // Log action
        await logSidebarAction({
            userId,
            action: 'find_ingredients',
            sessionId,
            result: { ingredientsFound: uniqueIngredients.length },
        });

        res.json({ ingredients: uniqueIngredients });

    } catch (error) {
        console.error('Find ingredients error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid request',
                details: error.errors,
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/tools/cost-breakdown
 * Calculate cost breakdown (GastroCount only)
 */
router.post('/cost-breakdown', async (req, res) => {
    try {
        const params = costBreakdownSchema.parse(req.body);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { sessionId } = params;

        // Verify session and agent type
        const [session] = await dbRead
            .select()
            .from(chatSessions)
            .where(and(
                eq(chatSessions.id, sessionId),
                eq(chatSessions.userId, userId)
            ));

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.agentType !== 'gastro_count') {
            return res.status(403).json({
                error: 'This tool is only available for GastroCount sessions'
            });
        }

        // Placeholder cost breakdown
        const breakdown = [
            { category: 'Ingredients', amount: 45.50, percentage: 35 },
            { category: 'Labor', amount: 62.00, percentage: 48 },
            { category: 'Overhead', amount: 22.50, percentage: 17 },
        ];

        const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

        // Log action
        await logSidebarAction({
            userId,
            action: 'cost_breakdown',
            sessionId,
            result: { total, items: breakdown.length },
        });

        res.json({ breakdown, total });

    } catch (error) {
        console.error('Cost breakdown error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid request',
                details: error.errors,
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/tools/reasoning-tree
 * Generate reasoning tree (GastroMind only)
 */
router.post('/reasoning-tree', async (req, res) => {
    try {
        const params = reasoningTreeSchema.parse(req.body);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { sessionId } = params;

        // Verify session and agent type
        const [session] = await dbRead
            .select()
            .from(chatSessions)
            .where(and(
                eq(chatSessions.id, sessionId),
                eq(chatSessions.userId, userId)
            ));

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.agentType !== 'gastro_mind') {
            return res.status(403).json({
                error: 'This tool is only available for GastroMind sessions'
            });
        }

        // Placeholder reasoning tree
        const tree = {
            id: 'root',
            label: 'User Question',
            children: [
                {
                    id: 'analysis',
                    label: 'Analysis',
                    children: [
                        { id: 'data', label: 'Data Collection' },
                        { id: 'processing', label: 'Processing' },
                    ],
                },
                {
                    id: 'conclusion',
                    label: 'Conclusion',
                    children: [
                        { id: 'result', label: 'Final Result' },
                    ],
                },
            ],
        };

        // Log action
        await logSidebarAction({
            userId,
            action: 'reasoning_tree',
            sessionId,
            result: { nodeCount: 6 },
        });

        res.json({ tree });

    } catch (error) {
        console.error('Reasoning tree error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid request',
                details: error.errors,
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Helper function to get tool description
 */
function getToolDescription(toolId: string): string {
    const descriptions: Record<string, string> = {
        summarize_chat: 'Summarize the conversation with key points',
        export_chat: 'Export chat history as Markdown or JSON',
        find_ingredients: 'Extract ingredients mentioned in the chat',
        cost_breakdown: 'Calculate cost breakdown for recipes/orders',
        reasoning_tree: 'Visualize reasoning steps and analysis',
    };

    return descriptions[toolId] || 'Tool description not available';
}

export default router;
