import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { suppliers } from '../../shared/schema.js';

// Базовые схемы из drizzle-orm
export const selectSupplierSchema = createSelectSchema(suppliers);
export const insertSupplierSchema = createInsertSchema(suppliers);

// Расширенные схемы для API с дополнительными полями и валидацией
export const SupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  contactPerson: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  address: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Схема для создания поставщика с валидацией
export const CreateSupplierSchema = z.object({
  name: z.string().min(1, 'Название поставщика обязательно').max(255, 'Название не должно превышать 255 символов'),
  contact_person: z.string().max(255, 'Имя контактного лица не должно превышать 255 символов').optional().nullable(),
  phone: z.string().max(50, 'Номер телефона не должен превышать 50 символов').optional().nullable(),
  email: z.string().email('Некорректный формат email').max(255, 'Email не должен превышать 255 символов').optional().nullable(),
  address: z.string().optional().nullable(),
});

// Схема для обновления поставщика
export const UpdateSupplierSchema = z.object({
  name: z.string().min(1, 'Название поставщика обязательно').max(255, 'Название не должно превышать 255 символов').optional(),
  contact_person: z.string().max(255, 'Имя контактного лица не должно превышать 255 символов').optional().nullable(),
  phone: z.string().max(50, 'Номер телефона не должен превышать 50 символов').optional().nullable(),
  email: z.string().email('Некорректный формат email').max(255, 'Email не должен превышать 255 символов').optional().nullable(),
  address: z.string().optional().nullable(),
});

// Схемы для API-запросов
export const GetSuppliersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(10).optional(),
  search: z.string().max(255, 'Поисковый запрос не должен превышать 255 символов').optional(),
});

export const SuppliersResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    suppliers: z.array(SupplierSchema),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
  }),
});

export const SupplierResponseSchema = z.object({
  ok: z.boolean(),
  data: SupplierSchema,
});

export const CreateSupplierRequestSchema = z.object({
  name: z.string().min(1, 'Название поставщика обязательно').max(255, 'Название не должно превышать 255 символов'),
  contact_person: z.string().max(255, 'Имя контактного лица не должно превышать 255 символов').optional().nullable(),
  phone: z.string().max(50, 'Номер телефона не должен превышать 50 символов').optional().nullable(),
  email: z.string().email('Некорректный формат email').max(255, 'Email не должен превышать 255 символов').optional().nullable(),
  address: z.string().optional().nullable(),
});

export const UpdateSupplierRequestSchema = z.object({
  name: z.string().min(1, 'Название поставщика обязательно').max(255, 'Название не должно превышать 255 символов').optional(),
  contact_person: z.string().max(255, 'Имя контактного лица не должно превышать 255 символов').optional().nullable(),
  phone: z.string().max(50, 'Номер телефона не должен превышать 50 символов').optional().nullable(),
  email: z.string().email('Некорректный формат email').max(255, 'Email не должен превышать 255 символов').optional().nullable(),
  address: z.string().optional().nullable(),
});

// Схемы для валидации телефонного номера
export const PhoneNumberSchema = z.string().regex(
  /^[\+]?[1-9][\d]{0,15}$/,
  'Номер телефона должен содержать только цифры и опционально начинаться с +'
).max(50, 'Номер телефона не должен превышать 50 символов').optional().nullable();

// Схемы для ошибок
export const SupplierErrorSchema = z.object({
  ok: z.boolean(),
  error: z.string(),
  message: z.string().optional(),
});

// Валидация уникальности email
export const EmailUniqueSchema = z.object({
  email: z.string().email('Некорректный формат email').max(255, 'Email не должен превышать 255 символов'),
});

// Экспортируем типы для использования в коде
export type Supplier = z.infer<typeof SupplierSchema>;
export type CreateSupplier = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplier = z.infer<typeof UpdateSupplierSchema>;
export type GetSuppliersQuery = z.infer<typeof GetSuppliersQuerySchema>;
export type SuppliersResponse = z.infer<typeof SuppliersResponseSchema>;
export type SupplierResponse = z.infer<typeof SupplierResponseSchema>;
export type CreateSupplierRequest = z.infer<typeof CreateSupplierRequestSchema>;
export type UpdateSupplierRequest = z.infer<typeof UpdateSupplierRequestSchema>;
export type PhoneNumber = z.infer<typeof PhoneNumberSchema>;
export type SupplierError = z.infer<typeof SupplierErrorSchema>;
export type EmailUnique = z.infer<typeof EmailUniqueSchema>;

// Константы для валидации
export const SUPPLIER_CONSTRAINTS = {
  NAME_MAX_LENGTH: 255,
  CONTACT_PERSON_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  ADDRESS_MAX_LENGTH: undefined, // text field без ограничения
} as const;

export const SUPPLIER_ERROR_MESSAGES = {
  NAME_REQUIRED: 'Название поставщика обязательно',
  NAME_TOO_LONG: `Название не должно превышать ${SUPPLIER_CONSTRAINTS.NAME_MAX_LENGTH} символов`,
  CONTACT_PERSON_TOO_LONG: `Имя контактного лица не должно превышать ${SUPPLIER_CONSTRAINTS.CONTACT_PERSON_MAX_LENGTH} символов`,
  PHONE_TOO_LONG: `Номер телефона не должен превышать ${SUPPLIER_CONSTRAINTS.PHONE_MAX_LENGTH} символов`,
  INVALID_PHONE_FORMAT: 'Номер телефона должен содержать только цифры и опционально начинаться с +',
  INVALID_EMAIL_FORMAT: 'Некорректный формат email',
  EMAIL_TOO_LONG: `Email не должен превышать ${SUPPLIER_CONSTRAINTS.EMAIL_MAX_LENGTH} символов`,
  EMAIL_ALREADY_EXISTS: 'Поставщик с таким email уже существует',
  SUPPLIER_NOT_FOUND: 'Поставщик не найден',
} as const;