import fs from 'fs';
import path from 'path';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Pin {
    id: string;
    userId: string;
    messageId: string;
    sessionId: string;
    content: string;
    createdAt: string;
}

export interface Favorite {
    id: string;
    userId: string;
    type: 'snippet' | 'prompt';
    title: string;
    content: string;
    tags?: string[];
    createdAt: string;
}

export interface Template {
    id: string;
    name: string;
    description: string;
    agentType?: string;
    content: string;
    category?: string;
    isPublic: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt?: string;
}

// ============================================================================
// File Paths
// ============================================================================

const DATA_DIR = path.join(process.cwd(), 'data', 'sidebar');

const PINS_FILE = path.join(DATA_DIR, 'pins.json');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');

// ============================================================================
// Storage Helper Functions
// ============================================================================

/**
 * Ensure data directory and files exist
 */
function ensureDataFiles(): void {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(PINS_FILE)) {
        fs.writeFileSync(PINS_FILE, '[]', 'utf-8');
    }

    if (!fs.existsSync(FAVORITES_FILE)) {
        fs.writeFileSync(FAVORITES_FILE, '[]', 'utf-8');
    }

    if (!fs.existsSync(TEMPLATES_FILE)) {
        fs.writeFileSync(TEMPLATES_FILE, '[]', 'utf-8');
    }
}

/**
 * Read JSON file safely
 */
function readJsonFile<T>(filePath: string): T[] {
    try {
        ensureDataFiles();
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content) as T[];
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

/**
 * Write JSON file safely
 */
function writeJsonFile<T>(filePath: string, data: T[]): void {
    try {
        ensureDataFiles();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        throw error;
    }
}

// ============================================================================
// Pins Store
// ============================================================================

export const pinsStore = {
    /**
     * Get all pins for a user
     */
    list(userId: string): Pin[] {
        const pins = readJsonFile<Pin>(PINS_FILE);
        return pins.filter(p => p.userId === userId);
    },

    /**
     * Get a specific pin
     */
    get(id: string, userId: string): Pin | undefined {
        const pins = readJsonFile<Pin>(PINS_FILE);
        return pins.find(p => p.id === id && p.userId === userId);
    },

    /**
     * Add a new pin
     */
    add(pin: Omit<Pin, 'id' | 'createdAt'>): Pin {
        const pins = readJsonFile<Pin>(PINS_FILE);

        const newPin: Pin = {
            ...pin,
            id: `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };

        pins.push(newPin);
        writeJsonFile(PINS_FILE, pins);

        return newPin;
    },

    /**
     * Remove a pin
     */
    remove(id: string, userId: string): boolean {
        const pins = readJsonFile<Pin>(PINS_FILE);
        const index = pins.findIndex(p => p.id === id && p.userId === userId);

        if (index === -1) {
            return false;
        }

        pins.splice(index, 1);
        writeJsonFile(PINS_FILE, pins);

        return true;
    },
};

// ============================================================================
// Favorites Store
// ============================================================================

export const favoritesStore = {
    /**
     * Get all favorites for a user
     */
    list(userId: string, type?: 'snippet' | 'prompt'): Favorite[] {
        const favorites = readJsonFile<Favorite>(FAVORITES_FILE);
        let filtered = favorites.filter(f => f.userId === userId);

        if (type) {
            filtered = filtered.filter(f => f.type === type);
        }

        return filtered;
    },

    /**
     * Get a specific favorite
     */
    get(id: string, userId: string): Favorite | undefined {
        const favorites = readJsonFile<Favorite>(FAVORITES_FILE);
        return favorites.find(f => f.id === id && f.userId === userId);
    },

    /**
     * Add a new favorite
     */
    add(favorite: Omit<Favorite, 'id' | 'createdAt'>): Favorite {
        const favorites = readJsonFile<Favorite>(FAVORITES_FILE);

        const newFavorite: Favorite = {
            ...favorite,
            id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };

        favorites.push(newFavorite);
        writeJsonFile(FAVORITES_FILE, favorites);

        return newFavorite;
    },

    /**
     * Update a favorite
     */
    update(id: string, userId: string, updates: Partial<Omit<Favorite, 'id' | 'userId' | 'createdAt'>>): Favorite | null {
        const favorites = readJsonFile<Favorite>(FAVORITES_FILE);
        const index = favorites.findIndex(f => f.id === id && f.userId === userId);

        if (index === -1) {
            return null;
        }

        favorites[index] = { ...favorites[index], ...updates };
        writeJsonFile(FAVORITES_FILE, favorites);

        return favorites[index];
    },

    /**
     * Remove a favorite
     */
    remove(id: string, userId: string): boolean {
        const favorites = readJsonFile<Favorite>(FAVORITES_FILE);
        const index = favorites.findIndex(f => f.id === id && f.userId === userId);

        if (index === -1) {
            return false;
        }

        favorites.splice(index, 1);
        writeJsonFile(FAVORITES_FILE, favorites);

        return true;
    },
};

// ============================================================================
// Templates Store
// ============================================================================

export const templatesStore = {
    /**
     * Get all templates (public + user's private ones)
     */
    list(userId: string, agentType?: string): Template[] {
        const templates = readJsonFile<Template>(TEMPLATES_FILE);
        let filtered = templates.filter(t => t.isPublic || t.createdBy === userId);

        if (agentType) {
            filtered = filtered.filter(t => !t.agentType || t.agentType === agentType);
        }

        return filtered;
    },

    /**
     * Get a specific template
     */
    get(id: string): Template | undefined {
        const templates = readJsonFile<Template>(TEMPLATES_FILE);
        return templates.find(t => t.id === id);
    },

    /**
     * Create a new template
     */
    create(template: Omit<Template, 'id' | 'createdAt'>): Template {
        const templates = readJsonFile<Template>(TEMPLATES_FILE);

        const newTemplate: Template = {
            ...template,
            id: `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };

        templates.push(newTemplate);
        writeJsonFile(TEMPLATES_FILE, templates);

        return newTemplate;
    },

    /**
     * Update a template
     */
    update(id: string, userId: string, updates: Partial<Omit<Template, 'id' | 'createdAt'>>): Template | null {
        const templates = readJsonFile<Template>(TEMPLATES_FILE);
        const index = templates.findIndex(t => t.id === id);

        if (index === -1) {
            return null;
        }

        // Only allow update if user is creator
        if (templates[index].createdBy !== userId) {
            return null;
        }

        templates[index] = {
            ...templates[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        writeJsonFile(TEMPLATES_FILE, templates);

        return templates[index];
    },

    /**
     * Delete a template
     */
    delete(id: string, userId: string): boolean {
        const templates = readJsonFile<Template>(TEMPLATES_FILE);
        const index = templates.findIndex(t => t.id === id);

        if (index === -1) {
            return false;
        }

        // Only allow delete if user is creator
        if (templates[index].createdBy !== userId) {
            return false;
        }

        templates.splice(index, 1);
        writeJsonFile(TEMPLATES_FILE, templates);

        return true;
    },
};

// Initialize data files on module load
ensureDataFiles();
