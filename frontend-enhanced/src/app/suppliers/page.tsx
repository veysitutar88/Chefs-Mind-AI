'use client';

import { useEffect, useState } from 'react';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suppliers`);
      const data = await response.json();
      if (data.ok) {
        setSuppliers(data.data.suppliers);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.ok) {
        setSuppliers([...suppliers, data.data]);
        setShowForm(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: ''
        });
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suppliers/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSuppliers(suppliers.filter(supplier => supplier.id !== id));
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Загрузка поставщиков...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" data-testid="suppliers-title">Поставщики</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          data-testid="create-supplier-button"
        >
          Создать поставщика
        </button>
      </div>

      {showForm && (
        <form onSubmit={createSupplier} className="mb-6 p-4 border rounded bg-gray-50" data-testid="supplier-form">
          <h2 className="text-lg font-semibold mb-4">Новый поставщик</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Название</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Телефон</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Адрес</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Создать
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="suppliers-list" data-testid="suppliers-list">
        {suppliers.length === 0 ? (
          <p className="text-gray-500">Поставщики не найдены</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Название</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">Телефон</th>
                <th className="border border-gray-300 px-4 py-2">Адрес</th>
                <th className="border border-gray-300 px-4 py-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50" data-testid={`supplier-${supplier.id}`}>
                  <td className="border border-gray-300 px-4 py-2">{supplier.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{supplier.email}</td>
                  <td className="border border-gray-300 px-4 py-2">{supplier.phone}</td>
                  <td className="border border-gray-300 px-4 py-2">{supplier.address}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => deleteSupplier(supplier.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                      data-testid={`delete-supplier-${supplier.id}`}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}