import express from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/jwtAuth.js';
import { requireRole } from '../middleware/rbac.js';
import { logSidebarAction } from '../utils/sidebar-logger.util.js';
import { templatesStore } from '../sidebar/sidebar-store.js';
import { dbRead } from '../db.js';
import { messages } from '../../shared/schema.js';
import { eq, lt, gt } from 'drizzle-orm';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireRole(['chef', 'accountant', 'admin']));

// ============================================================================
// Validation Schemas
// ============================================================================

const createTemplateSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional().default(''),
    content: z.string().min(1),
    agentType: z.string().optional(),
    category: z.string().optional(),
    isPublic: z.boolean().default(false),
});

const updateTemplateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    content: z.string().min(1).optional(),
    agentType: z.string().optional(),
    category: z.string().optional(),
    isPublic: z.boolean().optional(),
});

const deleteTemplateSchema = z.object({
    id: z.string(),
});

const quickActionSchema = z.object({
    text: z.string().min(1),
    targetLang: z.string().optional(),
    agentKey: z.string().optional(),
});

const navMessagesSchema = z.object({
    direction: z.enum(['up', 'down']),
    fromMessageId: z.string().optional(),
    limit: z.number().min(1).max(100).default(20),
});

// ============================================================================
// Templates Endpoints
// ============================================================================

/**
 * GET /api/sidebar/templates
 * Get all templates (public + user's private)
 */
router.get('/templates', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const agentType = req.query.agentType as string | undefined;
        const templates = templatesStore.list(userId, agentType);

        await logSidebarAction({
            userId,
            action: 'list_templates',
            result: { count: templates.length, agentType },
        });

        res.json({ templates });

    } catch (error) {
        console.error('List templates error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/sidebar/templates/create
 * Create a new template
 */
router.post('/templates/create', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const params = createTemplateSchema.parse(req.body);

        const template = templatesStore.create({
            ...params,
            createdBy: userId,
        });

        await logSidebarAction({
            userId,
            action: 'create_template',
            result: { templateId: template.id, name: template.name },
        });

        res.status(201).json({ template });

    } catch (error) {
        console.error('Create template error:', error);

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
 * POST /api/sidebar/templates/update
 * Update an existing template
 */
router.post('/templates/update', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id, ...updates } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Template ID is required' });
        }

        const validatedUpdates = updateTemplateSchema.parse(updates);

        const template = templatesStore.update(id, userId, validatedUpdates);

        if (!template) {
            return res.status(404).json({ error: 'Template not found or not authorized' });
        }

        await logSidebarAction({
            userId,
            action: 'update_template',
            result: { templateId: template.id },
        });

        res.json({ template });

    } catch (error) {
        console.error('Update template error:', error);

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
 * POST /api/sidebar/templates/delete
 * Delete a template
 */
router.post('/templates/delete', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const params = deleteTemplateSchema.parse(req.body);

        const deleted = templatesStore.delete(params.id, userId);

        if (!deleted) {
            return res.status(404).json({ error: 'Template not found or not authorized' });
        }

        await logSidebarAction({
            userId,
            action: 'delete_template',
            result: { templateId: params.id },
        });

        res.json({ success: true });

    } catch (error) {
        console.error('Delete template error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid request',
                details: error.errors,
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// Quick Actions Endpoints
// ============================================================================

/**
 * POST /api/sidebar/quick/rewrite
 * Rewrite text with AI assistance
 */
router.post('/quick/rewrite', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const params = quickActionSchema.parse(req.body);

        // TODO: Integrate with LLM for actual rewriting
        // For now, return a placeholder response
        const result = {
            original: params.text,
            rewritten: `[Rewritten] ${params.text}`,
            suggestions: ['Make it more concise', 'Use active voice', 'Add clarity'],
        };

        await logSidebarAction({
            userId,
            action: 'quick_rewrite',
            result: { textLength: params.text.length },
        });

        res.json(result);

    } catch (error) {
        console.error('Quick rewrite error:', error);

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
 * POST /api/sidebar/quick/fix
 * Fix grammar and spelling
 */
router.post('/quick/fix', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const params = quickActionSchema.parse(req.body);

        // TODO: Integrate with grammar checking service
        const result = {
            original: params.text,
            fixed: params.text, // Placeholder - no changes for now
            corrections: [],
        };

        await logSidebarAction({
            userId,
            action: 'quick_fix',
            result: { textLength: params.text.length },
        });

        res.json(result);

    } catch (error) {
        console.error('Quick fix error:', error);

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
 * POST /api/sidebar/quick/translate
 * Translate text to target language
 */
router.post('/quick/translate', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const params = quickActionSchema.parse(req.body);

        if (!params.targetLang) {
            return res.status(400).json({ error: 'targetLang is required for translation' });
        }

        // TODO: Integrate with translation API (Google Translate, DeepL, etc.)
        const result = {
            original: params.text,
            translated: `[${params.targetLang.toUpperCase()}] ${params.text}`,
            sourceLang: 'en',
            targetLang: params.targetLang,
        };

        await logSidebarAction({
            userId,
            action: 'quick_translate',
            result: { targetLang: params.targetLang },
        });

        res.json(result);

    } catch (error) {
        console.error('Quick translate error:', error);

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
 * POST /api/sidebar/quick/optimize
 * Optimize text for clarity and conciseness
 */
router.post('/quick/optimize', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const params = quickActionSchema.parse(req.body);

        // TODO: Integrate with LLM for text optimization
        const result = {
            original: params.text,
            optimized: params.text.trim(),
            improvements: [
                'Removed unnecessary words',
                'Improved clarity',
                'Made more concise',
            ],
            savedWords: 0,
        };

        await logSidebarAction({
            userId,
            action: 'quick_optimize',
            result: { textLength: params.text.length },
        });

        res.json(result);

    } catch (error) {
        console.error('Quick optimize error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid request',
                details: error.errors,
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// Navigator Endpoints
// ============================================================================

/**
 * GET /api/sidebar/nav/messages
 * Navigate messages (up/down) with pagination
 */
router.get('/nav/messages', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const params = navMessagesSchema.parse({
            direction: req.query.direction,
            fromMessageId: req.query.fromMessageId,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        });

        // TODO: Implement actual message navigation
        // For now, return empty array with correct typing
        const result: any[] = [];

        await logSidebarAction({
            userId,
            action: 'nav_messages',
            result: { direction: params.direction, count: result.length },
        });

        res.json({ messages: result, hasMore: false });

    } catch (error) {
        console.error('Navigate messages error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid request',
                details: error.errors,
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// Media Presets Endpoint
// ============================================================================

/**
 * GET /api/sidebar/media-presets
 * Get media generation presets for a specific agent
 */
router.get('/media-presets', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const agentKey = req.query.agentKey as string;

        // Hard-coded presets for FoodFrame
        const presets = [
            {
                id: 'food_square',
                label: 'Square (Instagram)',
                aspectRatio: '1:1',
                quality: 'high',
                provider: 'google_imagen',
                modelId: 'imagen-3.0-generate-001',
            },
            {
                id: 'food_portrait',
                label: 'Portrait (Story)',
                aspectRatio: '9:16',
                quality: 'high',
                provider: 'google_imagen',
                modelId: 'imagen-3.0-generate-001',
            },
            {
                id: 'food_landscape',
                label: 'Landscape (Banner)',
                aspectRatio: '16:9',
                quality: 'high',
                provider: 'google_imagen',
                modelId: 'imagen-3.0-generate-001',
            },
            {
                id: 'food_video_short',
                label: 'Short Video (TikTok)',
                aspectRatio: '9:16',
                quality: 'standard',
                provider: 'google_veo',
                modelId: 'veo-001',
                duration: 5,
            },
        ];

        // Filter by agent if needed
        const filteredPresets = agentKey === 'food_frame' ? presets : [];

        await logSidebarAction({
            userId,
            action: 'get_media_presets',
            result: { agentKey, count: filteredPresets.length },
        });

        res.json({ presets: filteredPresets });

    } catch (error) {
        console.error('Get media presets error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
