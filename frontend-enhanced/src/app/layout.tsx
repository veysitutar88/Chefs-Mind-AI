// c:\Projects\Chefs-Mind-AI\frontend-enhanced\src\app\layout.tsx
// layout.tsx — финальная разметка с брендовым бэкграундом
import '../styles/globals.css';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { useEffect } from 'react';

export const metadata = {
  title: "Chef's Mind AI - Управление рестораном",
  description:
    'Многоагентная ИИ‑платформа для управления рестораном с 5 специализированными агентами',
};

function AuthShim() {
  'use client';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // В prod не выполняем никаких действий
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    // Проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search);
    const isE2E = urlParams.get('e2e') === '1';

    if (!isE2E) {
      return; // Только в e2e режиме
    }

    const login = urlParams.get('login');
    const logout = urlParams.get('logout');

    // Обрабатываем логин
    if (login === 'admin') {
      localStorage.setItem('rbacRole', 'admin');
    }

    // Обрабатываем логаут
    if (logout === '1') {
      localStorage.removeItem('rbacRole');
    }
  }, []);

  return null; // Этот компонент не рендерит ничего видимого
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gradient-fine">
        <AuthShim />
        <div className="grid min-h-screen grid-rows-[64px_1fr] grid-cols-[280px_1fr]">
          <header className="row-start-1 col-span-2 border-b border-brand">
            <Header />
          </header>
          <aside className="row-start-2 col-start-1 border-r border-brand">
            <Sidebar />
          </aside>
          <main className="row-start-2 col-start-2 overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
