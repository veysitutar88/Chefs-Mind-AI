import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';

interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

interface OrdersListProps {
  orders: Order[];
  onRefresh: () => void; // Callback для обновления списка после удаления
}

export function OrdersList({ orders, onRefresh }: OrdersListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (orderId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
      return;
    }

    setDeletingId(orderId);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/orders/${orderId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении заказа');
      }

      alert('Заказ успешно удалён!');
      onRefresh(); // Обновляем список после успешного удаления
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
      alert(`Ошибка: ${errorMessage}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Список заказов</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-muted-foreground">Заказов пока нет</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{order.customerName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-medium">{order.totalAmount} ₽</p>
                      <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-800">
                        {order.status === 'pending' && 'Ожидает'}
                        {order.status === 'completed' && 'Выполнен'}
                        {order.status === 'cancelled' && 'Отменён'}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(order.id)}
                      disabled={deletingId === order.id}
                    >
                      {deletingId === order.id ? 'Удаление...' : 'Удалить'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}