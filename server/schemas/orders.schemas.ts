import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { orders } from '../../shared/schema.js';

// Базовые схемы из drizzle-orm
export const selectOrderSchema = createSelectSchema(orders);
export const insertOrderSchema = createInsertSchema(orders);

// Расширенные схемы для API с дополнительными полями и валидацией
export const OrderSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid().nullable(),
  orderDate: z.date(),
  status: z.string(),
  total: z.string().nullable(), // decimal stored as string
  items: z.record(z.any()).nullable(), // JSONB для items
  createdAt: z.date(),
});

// Схема для создания заказа с валидацией
export const CreateOrderSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  order_date: z.string().datetime().optional(),
  status: z.string().min(1, 'Статус заказа обязателен'),
  total: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Сумма должна быть числом с двумя знаками после запятой').optional().nullable(),
  items: z.record(z.any()).optional().nullable(),
});

// Схема для обновления заказа
export const UpdateOrderSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  order_date: z.string().datetime().optional(),
  status: z.string().min(1, 'Статус заказа обязателен').optional(),
  total: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Сумма должна быть числом с двумя знаками после запятой').optional().nullable(),
  items: z.record(z.any()).optional().nullable(),
});

// Статусы заказов
export const OrderStatusSchema = z.enum([
  'pending',      // Ожидает обработки
  'confirmed',    // Подтвержден
  'preparing',    // Готовится
  'ready',        // Готов
  'delivered',    // Доставлен
  'cancelled',    // Отменен
  'completed',    // Завершен
], {
  errorMap: () => ({ message: 'Недопустимый статус заказа' }),
});

// Схемы для API-запросов
export const GetOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(10).optional(),
  status: OrderStatusSchema.optional(),
});

export const OrdersResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    orders: z.array(OrderSchema),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
  }),
});

export const OrderResponseSchema = z.object({
  ok: z.boolean(),
  data: OrderSchema,
});

export const CreateOrderRequestSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  order_date: z.string().datetime().optional(),
  status: OrderStatusSchema,
  total: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Сумма должна быть числом с двумя знаками после запятой').optional().nullable(),
  items: z.record(z.any()).optional().nullable(),
});

export const UpdateOrderRequestSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  order_date: z.string().datetime().optional(),
  status: OrderStatusSchema.optional(),
  total: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Сумма должна быть числом с двумя знаками после запятой').optional().nullable(),
  items: z.record(z.any()).optional().nullable(),
});

// Экспортируем типы для использования в коде
export type Order = z.infer<typeof OrderSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type GetOrdersQuery = z.infer<typeof GetOrdersQuerySchema>;
export type OrdersResponse = z.infer<typeof OrdersResponseSchema>;
export type OrderResponse = z.infer<typeof OrderResponseSchema>;
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type UpdateOrderRequest = z.infer<typeof UpdateOrderRequestSchema>;