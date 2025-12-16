import { describe, test, expect } from 'vitest';
import { z } from 'zod';
import {
  // Orders schemas
  GetOrdersQuerySchema,
  CreateOrderSchema,
  UpdateOrderSchema,
  OrdersListResponseSchema,
  OrderResponseSchema,
  
  // Suppliers schemas
  GetSuppliersQuerySchema,
  CreateSupplierSchema,
  UpdateSupplierSchema,
  SuppliersListResponseSchema,
  SupplierResponseSchema,
} from '../schemas/orders.schemas.js';
import {
  CreateSupplierRequestSchema,
  UpdateSupplierRequestSchema,
} from '../schemas/suppliers.schemas.js';

describe('Zod Schema Validation Tests', () => {
  // Orders Schemas Tests
  describe('Orders Schemas', () => {
    describe('GetOrdersQuerySchema', () => {
      test('should validate valid query params', () => {
        const validParams = {
          page: 1,
          limit: 10,
          search: 'test search',
          status: 'pending',
          supplierId: '123e4567-e89b-12d3-a456-426614174000'
        };

        expect(() => GetOrdersQuerySchema.parse(validParams)).not.toThrow();
      });

      test('should validate query params with defaults', () => {
        const paramsWithDefaults = {};
        const parsed = GetOrdersQuerySchema.parse(paramsWithDefaults);
        
        expect(parsed).toEqual({
          page: 1,
          limit: 10,
          search: undefined,
          status: undefined,
          supplierId: undefined
        });
      });

      test('should reject invalid query params', () => {
        const invalidParams = {
          page: 'invalid',
          limit: -1,
          status: 'invalid_status',
          supplierId: 'not-uuid'
        };

        expect(() => GetOrdersQuerySchema.parse(invalidParams)).toThrow();
      });

      test('should reject page less than 1', () => {
        const invalidParams = { page: 0 };
        expect(() => GetOrdersQuerySchema.parse(invalidParams)).toThrow();
      });

      test('should reject limit greater than 100', () => {
        const invalidParams = { limit: 101 };
        expect(() => GetOrdersQuerySchema.parse(invalidParams)).toThrow();
      });
    });

    describe('CreateOrderSchema', () => {
      test('should validate valid order data', () => {
        const validOrder = {
          supplierId: '123e4567-e89b-12d3-a456-426614174000',
          items: [
            { name: 'Tomatoes', quantity: 10, unit: 'kg', unitPrice: 3.50 },
            { name: 'Potatoes', quantity: 5, unit: 'kg', unitPrice: 2.25 }
          ],
          totalAmount: 47.5,
          notes: 'Fresh vegetables for this week'
        };

        expect(() => CreateOrderSchema.parse(validOrder)).not.toThrow();
      });

      test('should validate order with minimum required fields', () => {
        const orderWithDefaults = {
          supplierId: '123e4567-e89b-12d3-a456-426614174000',
          items: [
            { name: 'Test Item', quantity: 1, unit: 'pcs', unitPrice: 10.0 }
          ],
          totalAmount: 10.0
        };

        const parsed = CreateOrderSchema.parse(orderWithDefaults);
        expect(parsed).toEqual(orderWithDefaults);
      });

      test('should reject invalid supplier ID', () => {
        const invalidOrder = {
          supplierId: 'invalid-uuid',
          items: [{ name: 'Test', quantity: 1, unit: 'pcs', unitPrice: 1.0 }],
          totalAmount: 1.0
        };

        expect(() => CreateOrderSchema.parse(invalidOrder)).toThrow();
      });

      test('should reject negative quantity', () => {
        const invalidOrder = {
          supplierId: '123e4567-e89b-12d3-a456-426614174000',
          items: [{ name: 'Test', quantity: -1, unit: 'pcs', unitPrice: 1.0 }],
          totalAmount: 1.0
        };

        expect(() => CreateOrderSchema.parse(invalidOrder)).toThrow();
      });

      test('should reject negative total amount', () => {
        const invalidOrder = {
          supplierId: '123e4567-e89b-12d3-a456-426614174000',
          items: [{ name: 'Test', quantity: 1, unit: 'pcs', unitPrice: 1.0 }],
          totalAmount: -1.0
        };

        expect(() => CreateOrderSchema.parse(invalidOrder)).toThrow();
      });

      test('should reject empty items array', () => {
        const invalidOrder = {
          supplierId: '123e4567-e89b-12d3-a456-426614174000',
          items: [],
          totalAmount: 0
        };

        expect(() => CreateOrderSchema.parse(invalidOrder)).toThrow();
      });

      test('should reject missing required fields', () => {
        const invalidOrder = {
          supplierId: '123e4567-e89b-12d3-a456-426614174000',
          // missing items and totalAmount
        };

        expect(() => CreateOrderSchema.parse(invalidOrder)).toThrow();
      });
    });

    describe('UpdateOrderSchema', () => {
      test('should validate valid update data', () => {
        const validUpdate = {
          items: [{ name: 'Updated Item', quantity: 5, unit: 'kg', unitPrice: 2.0 }],
          totalAmount: 10.0,
          notes: 'Updated notes'
        };

        expect(() => UpdateOrderSchema.parse(validUpdate)).not.toThrow();
      });

      test('should validate empty update object', () => {
        const emptyUpdate = {};
        const parsed = UpdateOrderSchema.parse(emptyUpdate);
        expect(parsed).toEqual(emptyUpdate);
      });

      test('should validate partial update', () => {
        const partialUpdate = { status: 'approved' };
        expect(() => UpdateOrderSchema.parse(partialUpdate)).not.toThrow();
      });

      test('should reject invalid update data', () => {
        const invalidUpdate = {
          status: 'invalid_status',
          totalAmount: 'not-number'
        };

        expect(() => UpdateOrderSchema.parse(invalidUpdate)).toThrow();
      });

      test('should reject negative total amount', () => {
        const invalidUpdate = { totalAmount: -1.0 };
        expect(() => UpdateOrderSchema.parse(invalidUpdate)).toThrow();
      });
    });

    describe('Response Schemas', () => {
      test('should validate OrdersListResponseSchema', () => {
        const validListResponse = {
          ok: true,
          data: {
            orders: [
              {
                id: '123e4567-e89b-12d3-a456-426614174001',
                supplierId: '123e4567-e89b-12d3-a456-426614174002',
                items: [{ name: 'Test', quantity: 1, unit: 'pcs', unitPrice: 1.0 }],
                totalAmount: 1.0,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1
          }
        };

        expect(() => OrdersListResponseSchema.parse(validListResponse)).not.toThrow();
      });

      test('should validate OrderResponseSchema', () => {
        const validOrderResponse = {
          ok: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            supplierId: '123e4567-e89b-12d3-a456-426614174002',
            items: [{ name: 'Test', quantity: 1, unit: 'pcs', unitPrice: 1.0 }],
            totalAmount: 1.0,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        };

        expect(() => OrderResponseSchema.parse(validOrderResponse)).not.toThrow();
      });
    });
  });

  // Suppliers Schemas Tests
  describe('Suppliers Schemas', () => {
    describe('GetSuppliersQuerySchema', () => {
      test('should validate valid query params', () => {
        const validParams = {
          page: 1,
          limit: 10,
          search: 'test supplier'
        };

        expect(() => GetSuppliersQuerySchema.parse(validParams)).not.toThrow();
      });

      test('should validate query params with defaults', () => {
        const paramsWithDefaults = {};
        const parsed = GetSuppliersQuerySchema.parse(paramsWithDefaults);
        
        expect(parsed).toEqual({
          page: 1,
          limit: 10,
          search: undefined
        });
      });

      test('should reject invalid query params', () => {
        const invalidParams = {
          page: 'invalid',
          limit: -1
        };

        expect(() => GetSuppliersQuerySchema.parse(invalidParams)).toThrow();
      });

      test('should reject page less than 1', () => {
        const invalidParams = { page: 0 };
        expect(() => GetSuppliersQuerySchema.parse(invalidParams)).toThrow();
      });
    });

    describe('CreateSupplierSchema', () => {
      test('should validate valid supplier data', () => {
        const validSupplier = {
          name: 'Fresh Farm Supplies',
          contactPerson: 'John Doe',
          phone: '+1-555-0123',
          email: 'john@freshfarm.com',
          address: '123 Farm Road, City, State 12345'
        };

        expect(() => CreateSupplierSchema.parse(validSupplier)).not.toThrow();
      });

      test('should validate supplier with minimum required fields', () => {
        const supplierWithDefaults = {
          name: 'Test Supplier'
        };

        const parsed = CreateSupplierSchema.parse(supplierWithDefaults);
        expect(parsed).toEqual(supplierWithDefaults);
      });

      test('should validate supplier with optional fields only', () => {
        const supplierWithOptional = {
          name: 'Optional Supplier',
          email: 'optional@test.com'
        };

        expect(() => CreateSupplierSchema.parse(supplierWithOptional)).not.toThrow();
      });

      test('should reject missing required name', () => {
        const invalidSupplier = {
          contactPerson: 'John Doe',
          email: 'john@test.com'
        };

        expect(() => CreateSupplierSchema.parse(invalidSupplier)).toThrow();
      });

      test('should reject invalid email format', () => {
        const invalidSupplier = {
          name: 'Test Supplier',
          email: 'invalid-email'
        };

        expect(() => CreateSupplierSchema.parse(invalidSupplier)).toThrow();
      });

      test('should reject invalid phone format', () => {
        const invalidSupplier = {
          name: 'Test Supplier',
          phone: 'invalid-phone'
        };

        expect(() => CreateSupplierSchema.parse(invalidSupplier)).toThrow();
      });

      test('should reject too long name', () => {
        const invalidSupplier = {
          name: 'A'.repeat(101) // Max length is 100
        };

        expect(() => CreateSupplierSchema.parse(invalidSupplier)).toThrow();
      });
    });

    describe('UpdateSupplierSchema', () => {
      test('should validate valid update data', () => {
        const validUpdate = {
          name: 'Updated Supplier Name',
          contactPerson: 'Jane Doe',
          phone: '+1-555-9999'
        };

        expect(() => UpdateSupplierSchema.parse(validUpdate)).not.toThrow();
      });

      test('should validate empty update object', () => {
        const emptyUpdate = {};
        const parsed = UpdateSupplierSchema.parse(emptyUpdate);
        expect(parsed).toEqual(emptyUpdate);
      });

      test('should validate partial update', () => {
        const partialUpdate = { email: 'newemail@test.com' };
        expect(() => UpdateSupplierSchema.parse(partialUpdate)).not.toThrow();
      });

      test('should reject invalid email format', () => {
        const invalidUpdate = { email: 'invalid-email' };
        expect(() => UpdateSupplierSchema.parse(invalidUpdate)).toThrow();
      });
    });

    // Additional tests for supplier request schemas
    describe('CreateSupplierRequestSchema', () => {
      test('should validate valid request data', () => {
        const validRequest = {
          name: 'Test Supplier',
          contactPerson: 'John Doe',
          phone: '+1-555-0123',
          email: 'test@supplier.com',
          address: '123 Test St'
        };

        expect(() => CreateSupplierRequestSchema.parse(validRequest)).not.toThrow();
      });

      test('should reject missing required name', () => {
        const invalidRequest = {
          contactPerson: 'John Doe',
          email: 'test@supplier.com'
        };

        expect(() => CreateSupplierRequestSchema.parse(invalidRequest)).toThrow();
      });

      test('should reject invalid email format', () => {
        const invalidRequest = {
          name: 'Test Supplier',
          email: 'invalid-email'
        };

        expect(() => CreateSupplierRequestSchema.parse(invalidRequest)).toThrow();
      });
    });

    describe('UpdateSupplierRequestSchema', () => {
      test('should validate valid request data', () => {
        const validRequest = {
          name: 'Updated Supplier'
        };

        expect(() => UpdateSupplierRequestSchema.parse(validRequest)).not.toThrow();
      });

      test('should validate empty request', () => {
        const emptyRequest = {};
        const parsed = UpdateSupplierRequestSchema.parse(emptyRequest);
        expect(parsed).toEqual(emptyRequest);
      });
    });

    describe('Response Schemas', () => {
      test('should validate SuppliersListResponseSchema', () => {
        const validListResponse = {
          ok: true,
          data: {
            suppliers: [
              {
                id: '123e4567-e89b-12d3-a456-426614174001',
                name: 'Test Supplier',
                contactPerson: 'John Doe',
                phone: '+1-555-0123',
                email: 'test@supplier.com',
                address: '123 Test St',
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1
          }
        };

        expect(() => SuppliersListResponseSchema.parse(validListResponse)).not.toThrow();
      });

      test('should validate SupplierResponseSchema', () => {
        const validSupplierResponse = {
          ok: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Test Supplier',
            contactPerson: 'John Doe',
            phone: '+1-555-0123',
            email: 'test@supplier.com',
            address: '123 Test St',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        };

        expect(() => SupplierResponseSchema.parse(validSupplierResponse)).not.toThrow();
      });
    });
  });

  // Edge Cases and Boundary Tests
  describe('Edge Cases', () => {
    describe('Orders Edge Cases', () => {
      test('should handle very large page numbers', () => {
        const validParams = { page: 999999 };
        expect(() => GetOrdersQuerySchema.parse(validParams)).not.toThrow();
      });

      test('should handle boundary limit values', () => {
        const validParams = { limit: 1 };
        expect(() => GetOrdersQuerySchema.parse(validParams)).not.toThrow();

        const invalidParams = { limit: 101 };
        expect(() => GetOrdersQuerySchema.parse(invalidParams)).toThrow();
      });

      test('should handle maximum length search string', () => {
        const validParams = { search: 'a'.repeat(100) };
        expect(() => GetOrdersQuerySchema.parse(validParams)).not.toThrow();
      });

      test('should handle decimal quantities and prices', () => {
        const validOrder = {
          supplierId: '123e4567-e89b-12d3-a456-426614174000',
          items: [
            { name: 'Test Item', quantity: 0.5, unit: 'kg', unitPrice: 2.75 }
          ],
          totalAmount: 1.375
        };

        expect(() => CreateOrderSchema.parse(validOrder)).not.toThrow();
      });
    });

    describe('Suppliers Edge Cases', () => {
      test('should handle boundary name lengths', () => {
        const validSupplier = { name: 'a'.repeat(1) };
        expect(() => CreateSupplierSchema.parse(validSupplier)).not.toThrow();

        const validMaxSupplier = { name: 'a'.repeat(100) };
        expect(() => CreateSupplierSchema.parse(validMaxSupplier)).not.toThrow();
      });

      test('should handle boundary contact person lengths', () => {
        const validSupplier = { 
          name: 'Test Supplier',
          contactPerson: 'a'.repeat(50)
        };
        expect(() => CreateSupplierSchema.parse(validSupplier)).not.toThrow();
      });

      test('should handle boundary address lengths', () => {
        const validSupplier = { 
          name: 'Test Supplier',
          address: 'a'.repeat(200)
        };
        expect(() => CreateSupplierSchema.parse(validSupplier)).not.toThrow();
      });

      test('should handle various phone formats', () => {
        const testPhones = [
          '+1-555-0123',
          '(555) 123-4567',
          '555.123.4567',
          '5551234567'
        ];

        testPhones.forEach(phone => {
          const validSupplier = { name: 'Test', phone };
          expect(() => CreateSupplierSchema.parse(validSupplier)).not.toThrow();
        });
      });
    });
  });

  // Error Message Tests
  describe('Error Messages', () => {
    test('should provide meaningful error messages for orders', () => {
      try {
        CreateOrderSchema.parse({});
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues).toHaveLength.greaterThan(0);
        
        // Check that error contains information about required fields
        const errorMessages = zodError.issues.map(issue => issue.message);
        expect(errorMessages.some(msg => msg.includes('required') || msg.includes('необходимо'))).toBe(true);
      }
    });

    test('should provide meaningful error messages for suppliers', () => {
      try {
        CreateSupplierSchema.parse({});
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues).toHaveLength.greaterThan(0);
        
        // Check that error contains information about required fields
        const errorMessages = zodError.issues.map(issue => issue.message);
        expect(errorMessages.some(msg => msg.includes('required') || msg.includes('необходимо'))).toBe(true);
      }
    });
  });
});