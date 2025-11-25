import express from 'express';
import { z } from 'zod';
import { dbRead } from '../db.js';
import { messages, chatSessions } from '../../shared/schema.js';
import { eq, and, sql, desc } from 'drizzle-orm';
import { authenticate } from '../middleware/jwtAuth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireRole(['chef', 'accountant', 'admin']));

// Validation schemas
const searchMessagesSchema = z.object({
    q: z.string().min(1).max(500),
    agentId: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
});

const searchLibrarySchema = z.object({
    q: z.string().min(1).max(500),
    fileType: z.enum(['md', 'pdf', 'txt', 'all']).optional().default('all'),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
});

const searchTemplatesSchema = z.object({
    q: z.string().min(1).max(500),
    category: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
});

const searchTagsSchema = z.object({
    tags: z.array(z.string()).min(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
});

/**
 * Simple fuzzy matching score (0-1)
 */
function fuzzyMatch(query: string, target: string): number {
    const q = query.toLowerCase();
    const t = target.toLowerCase();

    // Exact match
    if (t.includes(q)) return 1.0;

    // Word boundary match
    const words = t.split(/\s+/);
    for (const word of words) {
        if (word.startsWith(q)) return 0.9;
        if (word.includes(q)) return 0.7;
    }

    // Character overlap
    let matches = 0;
    for (const char of q) {
        if (t.includes(char)) matches++;
    }

    return matches / q.length * 0.5;
}

/**
 * Expand query with synonyms
 */
function expandQuery(query: string): string[] {
    const synonyms: Record<string, string[]> = {
        'chef': ['cook', 'culinary', 'kitchen'],
        'food': ['dish', 'meal', 'recipe', 'cuisine'],
        'recipe': ['formula', 'instruction', 'cooking', 'preparation'],
        'cost': ['price', 'expense', 'budget'],
        'ingredient': ['component', 'element', 'item'],
    };

    const terms = [query];
    const q = query.toLowerCase();

    for (const [key, syns] of Object.entries(synonyms)) {
        if (q.includes(key)) {
            terms.push(...syns);
        }
    }

    return terms;
}

/**
 * GET /api/search/messages
 * Search chat messages with fuzzy matching
 */
router.get('/messages', async (req, res) => {
    try {
        const params = searchMessagesSchema.parse(req.query);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { q, agentId, limit, offset } = params;
        const searchTerms = expandQuery(q);

        // Build query conditions for sessions
        const sessionConditions = [
            eq(chatSessions.userId, userId),
        ];

        if (agentId) {
            sessionConditions.push(eq(chatSessions.agentType, agentId));
        }

        // Search in message content
        const orConditions = searchTerms.map(term =>
            sql`${messages.content} ILIKE ${`%${term}%`}`
        );

        const query = dbRead
            .select({
                id: messages.id,
                sessionId: messages.sessionId,
                content: messages.content,
                role: messages.role,
                createdAt: messages.createdAt,
                agentType: chatSessions.agentType,
            })
            .from(messages)
            .innerJoin(chatSessions, eq(messages.sessionId, chatSessions.id))
            .where(and(
                ...sessionConditions,
                sql`(${sql.join(orConditions, sql` OR `)})`
            ))
            .orderBy(desc(messages.createdAt))
            .limit(limit)
            .offset(offset);

        const results = await query;

        // Calculate fuzzy match scores and sort
        const scoredResults = results.map(r => ({
            ...r,
            score: fuzzyMatch(q, r.content || ''),
        }))
            .filter(r => r.score > 0.3)
            .sort((a, b) => b.score - a.score);

        // Get total count
        const countQuery = dbRead
            .select({ count: sql`count(*)` })
            .from(messages)
            .innerJoin(chatSessions, eq(messages.sessionId, chatSessions.id))
            .where(and(
                ...sessionConditions,
                sql`(${sql.join(orConditions, sql` OR `)})`
            ));

        const [{ count }] = await countQuery;

        res.json({
            results: scoredResults,
            total: Number(count),
            query: q,
            limit,
            offset,
        });

    } catch (error) {
        console.error('Search messages error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid query parameters',
                details: error.errors,
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/search/library
 * Search library files (placeholder - assumes files metadata in DB)
 */
router.get('/library', async (req, res) => {
    try {
        const params = searchLibrarySchema.parse(req.query);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { q, fileType, limit, offset } = params;

        // Placeholder: In a real implementation, this would search a files table or filesystem
        res.json({
            results: [],
            total: 0,
            query: q,
            fileType,
            limit,
            offset,
            message: 'Library search not yet implemented - requires files metadata table',
        });

    } catch (error) {
        console.error('Search library error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid query parameters',
                details: error.errors,
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/search/templates
 * Search templates (placeholder)
 */
router.get('/templates', async (req, res) => {
    try {
        const params = searchTemplatesSchema.parse(req.query);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { q, category, limit, offset } = params;

        // Placeholder: In a real implementation, this would search templates
        res.json({
            results: [],
            total: 0,
            query: q,
            category,
            limit,
            offset,
            message: 'Templates search not yet implemented - requires templates system',
        });

    } catch (error) {
        console.error('Search templates error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid query parameters',
                details: error.errors,
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/search/tags
 * Search by tags (placeholder)
 */
router.get('/tags', async (req, res) => {
    try {
        // Parse tags array from query string
        const tags = Array.isArray(req.query.tags)
            ? req.query.tags
            : req.query.tags
                ? [req.query.tags]
                : [];

        const params = searchTagsSchema.parse({
            ...req.query,
            tags,
        });

        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { tags: searchTags, limit, offset } = params;

        // Placeholder: In a real implementation, this would search tagged items
        res.json({
            results: [],
            total: 0,
            tags: searchTags,
            limit,
            offset,
            message: 'Tag search not yet implemented - requires tagging system',
        });

    } catch (error) {
        console.error('Search tags error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid query parameters',
                details: error.errors,
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
