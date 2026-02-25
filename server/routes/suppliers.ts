import express from 'express';
import { dbWrite, dbRead } from '../db.js';
import { suppliers } from '../../shared/schema.js';
import { eq, and, desc, sql, like } from 'drizzle-orm';
import {
  GetSuppliersQuerySchema,
  CreateSupplierRequestSchema,
  UpdateSupplierRequestSchema
} from '../schemas/suppliers.schemas.js';

const router = express.Router();

// GET /api/suppliers - получение списка поставщиков с пагинацией
router.get('/', async (req, res) => {
  try {
    // Валидация query параметров
    const queryValidation = GetSuppliersQuerySchema.safeParse(req.query);
    
    if (!queryValidation.success) {
      return res.status(400).json({
        ok: false,
        error: 'Некорректные параметры запроса',
        details: queryValidation.error.issues
      });
    }

    const { page, limit, search } = queryValidation.data;
    const safeOffset = ((page ?? 1) - 1) * (limit ?? 10);
    
    // Построение условий запроса
    const conditions = [];
    
    if (search) {
      conditions.push(like(suppliers.name, `%${search}%`));
    }

    // Получение общего количества записей
    const [{ count }] = await dbRead
      .select({ count: sql`count(*)` })
      .from(suppliers)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Получение записей с пагинацией
    const suppliersList = await dbRead
      .select()
      .from(suppliers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(suppliers.name))
      .limit(limit ?? 10)
      .offset(safeOffset);

    res.json({
      ok: true,
      data: {
        suppliers: suppliersList,
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка при получении списка поставщиков:', error);
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось получить список поставщиков'
    });
  }
});

// GET /api/suppliers/:id - получение одного поставщика по ID
router.get('/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    
    const [supplier] = await dbRead
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, supplierId));

    if (!supplier) {
      return res.status(404).json({
        ok: false,
        error: 'Поставщик не найден'
      });
    }

    res.json({
      ok: true,
      data: supplier
    });
  } catch (error) {
    console.error('Ошибка при получении поставщика:', error);
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось получить поставщика'
    });
  }
});

// POST /api/suppliers - создание нового поставщика
router.post('/', async (req, res) => {
  try {
    // Валидация входных данных
    const validation = CreateSupplierRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        ok: false,
        error: 'Некорректные данные поставщика',
        details: validation.error.issues
      });
    }

    const { name, contact_person: contactPerson, phone, email, address } = validation.data;

    // Проверка уникальности email если указан
    if (email) {
      const [existingSupplier] = await dbRead
        .select()
        .from(suppliers)
        .where(eq(suppliers.email, email));

      if (existingSupplier) {
        return res.status(409).json({
          ok: false,
          error: 'Поставщик с таким email уже существует'
        });
      }
    }

    const [newSupplier] = await dbWrite
      .insert(suppliers)
      .values({
        name,
        contact_person: contactPerson || null,
        phone: phone || null,
        email: email || null,
        address: address || null
      })
      .returning();

    res.status(201).json({
      ok: true,
      data: newSupplier
    });
  } catch (error) {
    console.error('Ошибка при создании поставщика:', error);
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось создать поставщика'
    });
  }
});

// PUT /api/suppliers/:id - обновление поставщика
router.put('/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    
    // Валидация входных данных
    const validation = UpdateSupplierRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        ok: false,
        error: 'Некорректные данные поставщика',
        details: validation.error.issues
      });
    }

    const { name, contact_person: contactPerson, phone, email, address } = validation.data;

    // Проверяем существование поставщика
    const [existingSupplier] = await dbRead
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, supplierId));

    if (!existingSupplier) {
      return res.status(404).json({
        ok: false,
        error: 'Поставщик не найден'
      });
    }

    // Проверка уникальности email если изменяется
    if (email && email !== existingSupplier.email) {
      const [supplierWithEmail] = await dbRead
        .select()
        .from(suppliers)
        .where(eq(suppliers.email, email));

      if (supplierWithEmail) {
        return res.status(409).json({
          ok: false,
          error: 'Поставщик с таким email уже существует'
        });
      }
    }

    const [updatedSupplier] = await dbWrite
      .update(suppliers)
      .set({
        name,
        contact_person: contactPerson !== undefined ? contactPerson : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        address: address !== undefined ? address : undefined
      })
      .where(eq(suppliers.id, supplierId))
      .returning();

    res.json({
      ok: true,
      data: updatedSupplier
    });
  } catch (error) {
    console.error('Ошибка при обновлении поставщика:', error);
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось обновить поставщика'
    });
  }
});

// DELETE /api/suppliers/:id - удаление поставщика
router.delete('/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;

    // Проверяем существование поставщика
    const [existingSupplier] = await dbRead
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, supplierId));

    if (!existingSupplier) {
      return res.status(404).json({
        ok: false,
        error: 'Поставщик не найден'
      });
    }

    await dbWrite
      .delete(suppliers)
      .where(eq(suppliers.id, supplierId));

    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении поставщика:', error);
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось удалить поставщика'
    });
  }
});

export default router;