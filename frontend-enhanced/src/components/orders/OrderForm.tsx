import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Input } from '../ui/input.tsx';
import { Button } from '../ui/button.tsx';

interface OrderFormProps {
  orderId?: string;
  initialData?: {
    customerName: string;
    totalAmount: number;
    status: 'pending' | 'completed' | 'cancelled';
  };
  onSuccess?: () => void; // Callback для обновления списка после успешного сохранения
}

interface OrderFormData {
  customerName: string;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export function OrderForm({ orderId, initialData, onSuccess }: OrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: initialData?.customerName || '',
    totalAmount: initialData?.totalAmount || 0,
    status: initialData?.status || 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = orderId
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/orders/${orderId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/orders`;
      
      const method = orderId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при сохранении заказа');
      }

      // Уведомление пользователя об успехе
      alert(orderId ? 'Заказ успешно обновлён!' : 'Заказ успешно создан!');

      // Вызов callback для обновления списка
      if (onSuccess) {
        onSuccess();
      }

      // Очистка формы если это создание нового заказа
      if (!orderId) {
        setFormData({
          customerName: '',
          totalAmount: 0,
          status: 'pending',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof OrderFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {orderId ? 'Редактировать заказ' : 'Создать новый заказ'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Имя клиента</label>
            <Input
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="Введите имя клиента"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Сумма</label>
            <Input
              type="number"
              value={formData.totalAmount}
              onChange={(e) => handleInputChange('totalAmount', Number(e.target.value))}
              placeholder="0"
              min="0"
              step="0.01"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Статус</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as 'pending' | 'completed' | 'cancelled')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={loading}
            >
              <option value="pending">Ожидает</option>
              <option value="completed">Выполнен</option>
              <option value="cancelled">Отменён</option>
            </select>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? 'Сохранение...'
              : orderId
                ? 'Обновить заказ'
                : 'Создать заказ'
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}