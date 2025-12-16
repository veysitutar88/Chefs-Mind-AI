import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Input } from '../ui/input.tsx';
import { Button } from '../ui/button.tsx';

interface SupplierFormProps {
  supplierId?: string;
  initialData?: {
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    isActive: boolean;
  };
  onSuccess?: () => void; // Callback для обновления списка после успешного сохранения
}

interface SupplierFormData {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
}

export function SupplierForm({ supplierId, initialData, onSuccess }: SupplierFormProps) {
  const [formData, setFormData] = useState<SupplierFormData>({
    name: initialData?.name || '',
    contactPerson: initialData?.contactPerson || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    isActive: initialData?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = supplierId
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/suppliers/${supplierId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/suppliers`;
      
      const method = supplierId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при сохранении поставщика');
      }

      // Уведомление пользователя об успехе
      alert(supplierId ? 'Поставщик успешно обновлён!' : 'Поставщик успешно создан!');

      // Вызов callback для обновления списка
      if (onSuccess) {
        onSuccess();
      }

      // Очистка формы если это создание нового поставщика
      if (!supplierId) {
        setFormData({
          name: '',
          contactPerson: '',
          phone: '',
          email: '',
          address: '',
          isActive: true,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SupplierFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {supplierId ? 'Редактировать поставщика' : 'Создать нового поставщика'}
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
            <label className="block text-sm font-medium mb-1">Название компании</label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Введите название компании"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Контактное лицо</label>
            <Input
              value={formData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              placeholder="Введите имя контактного лица"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Телефон</label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+7 (999) 123-45-67"
              type="tel"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="supplier@example.com"
              type="email"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Адрес</label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Введите адрес компании"
              required
              disabled={loading}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded border-gray-300"
              disabled={loading}
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Активный поставщик
            </label>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? 'Сохранение...'
              : supplierId
                ? 'Обновить поставщика'
                : 'Создать поставщика'
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}