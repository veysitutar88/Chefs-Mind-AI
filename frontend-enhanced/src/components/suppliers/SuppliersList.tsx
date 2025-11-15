import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
}

interface SuppliersListProps {
  suppliers: Supplier[];
  onRefresh: () => void; // Callback для обновления списка после удаления
}

export function SuppliersList({ suppliers, onRefresh }: SuppliersListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (supplierId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого поставщика?')) {
      return;
    }

    setDeletingId(supplierId);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/suppliers/${supplierId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении поставщика');
      }

      alert('Поставщик успешно удалён!');
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
        <CardTitle>Список поставщиков</CardTitle>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <p className="text-muted-foreground">Поставщиков пока нет</p>
        ) : (
          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{supplier.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        supplier.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {supplier.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Контактное лицо: {supplier.contactPerson}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      Телефон: {supplier.phone}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      Email: {supplier.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Адрес: {supplier.address}
                    </p>
                  </div>
                  <div className="ml-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(supplier.id)}
                      disabled={deletingId === supplier.id}
                    >
                      {deletingId === supplier.id ? 'Удаление...' : 'Удалить'}
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