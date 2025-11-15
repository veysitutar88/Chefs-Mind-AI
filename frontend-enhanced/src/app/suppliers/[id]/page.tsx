'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { SupplierForm } from '../../../components/suppliers/SupplierForm';

export default function SupplierDetailPage() {
  const params = useParams();
  const supplierId = params.id as string;

  // Mock данные для демонстрации
  const mockSupplier = {
    name: 'ООО "Продукты Плюс"',
    contactPerson: 'Александр Иванов',
    phone: '+7 (495) 123-45-67',
    email: 'a.ivanov@productyplus.ru',
    address: 'г. Москва, ул. Промышленная, 15',
    isActive: true,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Детали поставщика #{supplierId}</h1>
        <p className="text-muted-foreground mt-2">
          Просмотр и редактирование информации о поставщике
        </p>
      </div>
      
      <div className="space-y-6">
        <SupplierForm initialData={mockSupplier} />
        
        <div className="bg-muted p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Дополнительная информация</h3>
          <div className="space-y-2 text-sm">
            <p><strong>ID поставщика:</strong> {supplierId}</p>
            <p><strong>Дата регистрации:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Статус:</strong> {mockSupplier.isActive ? 'Активен' : 'Неактивен'}</p>
            <p><strong>Рейтинг:</strong> ⭐⭐⭐⭐⭐ (5/5)</p>
            <p><strong>Последний заказ:</strong> 10.11.2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}