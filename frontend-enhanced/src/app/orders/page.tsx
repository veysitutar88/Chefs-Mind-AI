'use client';

import { useEffect, useState } from 'react';

interface Order {
  id: string;
  name: string;
  supplierId: string;
  totalAmount: number;
  status: string;
  items: any[];
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    supplierId: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    totalAmount: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`);
      const data = await response.json();
      if (data.ok) {
        setOrders(data.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.ok) {
        setOrders([...orders, data.data]);
        setShowForm(false);
        setFormData({
          name: '',
          supplierId: '',
          items: [{ name: '', quantity: 1, price: 0 }],
          totalAmount: 0
        });
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setOrders(orders.filter(order => order.id !== id));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Загрузка заказов...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" data-testid="orders-title">Заказы</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          data-testid="create-order-button"
        >
          Создать заказ
        </button>
      </div>

      {showForm && (
        <form onSubmit={createOrder} className="mb-6 p-4 border rounded bg-gray-50" data-testid="order-form">
          <h2 className="text-lg font-semibold mb-4">Новый заказ</h2>
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
            <label className="block text-sm font-medium mb-2">ID поставщика</label>
            <input
              type="text"
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Общая сумма</label>
            <input
              type="number"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
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

      <div className="orders-list" data-testid="orders-list">
        {orders.length === 0 ? (
          <p className="text-gray-500">Заказы не найдены</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Название</th>
                <th className="border border-gray-300 px-4 py-2">Поставщик</th>
                <th className="border border-gray-300 px-4 py-2">Сумма</th>
                <th className="border border-gray-300 px-4 py-2">Статус</th>
                <th className="border border-gray-300 px-4 py-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50" data-testid={`order-${order.id}`}>
                  <td className="border border-gray-300 px-4 py-2">{order.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.supplierId}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.totalAmount}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.status}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                      data-testid={`delete-order-${order.id}`}
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