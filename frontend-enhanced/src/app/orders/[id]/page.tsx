'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { OrderForm } from '../../../components/orders/OrderForm';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  // Mock данные для демонстрации
  const mockOrder = {
    id: orderId,
    customerName: 'Иван Петров',
    totalAmount: 2500.00,
    status: 'pending' as const,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Детали заказа #{orderId}</h1>
        <p className="text-muted-foreground mt-2">
          Просмотр и редактирование информации о заказе
        </p>
      </div>
      
      <div className="space-y-6">
        <OrderForm initialData={mockOrder} />
        
        <div className="bg-muted p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Дополнительная информация</h3>
          <div className="space-y-2 text-sm">
            <p><strong>ID заказа:</strong> {orderId}</p>
            <p><strong>Дата создания:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Статус:</strong> {
              mockOrder.status === 'pending' ? 'Ожидает' :
              mockOrder.status === 'completed' ? 'Выполнен' :
              mockOrder.status === 'cancelled' ? 'Отменён' :
              'Неизвестно'
            }</p>
          </div>
        </div>
      </div>
    </div>
  );
}