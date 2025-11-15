import express from 'express';
import { dbWrite, dbRead } from '../db.js';
import { orders } from '../../shared/schema.js';
import { eq, and, desc, sql, like } from 'drizzle-orm';
import {
  GetOrdersQuerySchema,
  CreateOrderRequestSchema,
  UpdateOrderRequestSchema,
  OrderStatusSchema
} from '../schemas/orders.schemas.js';

const router = express.Router();

// GET /api/orders - получение списка заказов с пагинацией и фильтрацией
router.get('/', async (req, res) => {
  try {
    // Валидация query параметров
    const queryValidation = GetOrdersQuerySchema.safeParse(req.query);
    
    if (!queryValidation.success) {
      return res.status(400).json({
        ok: false,
        error: 'Некорректные параметры запроса',
        details: queryValidation.error.issues
      });
    }

    const { page, limit, status } = queryValidation.data;
    const offset = (page - 1) * limit;
    
    // Построение условий запроса
    const conditions = [];
    
    if (status) {
      conditions.push(eq(orders.status, status));
    }

    // Получение общего количества записей
    const [{ count }] = await dbRead
      .select({ count: sql`count(*)` })
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Получение записей с пагинацией
    const ordersList = await dbRead
      .select()
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(orders.order_date))
      .limit(limit)
      .offset(offset);

    res.json({
      ok: true,
      data: {
        orders: ordersList,
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка при получении списка заказов:', error);
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось получить список заказов'
    });
  }
});

// GET /api/orders/:id - получение одного заказа по ID
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const [order] = await dbRead
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!order) {
      return res.status(404).json({
        ok: false,
        error: 'Заказ не найден'
      });
    }

    res.json({
      ok: true,
      data: order
    });
  } catch (error) {
    console.error('Ошибка при получении заказа:', error);
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось получить заказ'
    });
  }
});

// POST /api/orders - создание нового заказа
router.post('/', async (req, res) => {
  try {
    // Валидация входных данных
    const validation = CreateOrderRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        ok: false,
        error: 'Некорректные данные заказа',
        details: validation.error.issues
      });
    }

    const { customer_id, order_date, status, total, items } = validation.data;

    const [newOrder] = await dbWrite
      .insert(orders)
      .values({
        customerId: customer_id || null,
        orderDate: order_date ? new Date(order_date) : new Date(),
        status,
        total: total !== undefined ? String(total) : null,
        items: items || null
      })
      .returning();

    res.status(201).json({
      ok: true,
      data: newOrder
    });
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось создать заказ'
    });
  }
});

// PUT /api/orders/:id - обновление заказа
router.put('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Валидация входных данных
    const validation = UpdateOrderRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        ok: false,
        error: 'Некорректные данные заказа',
        details: validation.error.issues
      });
    }

    const { customer_id, order_date, status, total, items } = validation.data;

    // Проверяем существование заказа
    const [existingOrder] = await dbRead
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!existingOrder) {
      return res.status(404).json({
        ok: false,
        error: 'Заказ не найден'
      });
    }

    const [updatedOrder] = await dbWrite
      .update(orders)
      .set({
        customerId: customer_id !== undefined ? customer_id : undefined,
        orderDate: order_date ? new Date(order_date) : undefined,
        status,
        total: total !== undefined ? String(total) : undefined,
        items: items !== undefined ? items : undefined
      })
      .where(eq(orders.id, orderId))
      .returning();

    res.json({
      ok: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Ошибка при обновлении заказа:', error);
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось обновить заказ'
    });
  }
});

// DELETE /api/orders/:id - удаление заказа
router.delete('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;

    // Проверяем существование заказа
    const [existingOrder] = await dbRead
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!existingOrder) {
      return res.status(404).json({
        ok: false,
        error: 'Заказ не найден'
      });
    }

    await dbWrite
      .delete(orders)
      .where(eq(orders.id, orderId));

    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении заказа:', error);
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось удалить заказ'
    });
  }
});

export default router;