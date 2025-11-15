'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Проверяем статус аутентификации
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/auth/google/status');
        const data = await response.json();
        
        if (data.ok) {
          // Пользователь аутентифицирован, перенаправляем на dashboard
          router.push('/dashboard');
        } else {
          // Пользователь не аутентифицирован, перенаправляем на login
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
        // В случае ошибки перенаправляем на login
        router.push('/login');
      }
    };

    checkAuthStatus();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Chef's Mind AI
        </h1>
        <p className="text-gray-600">Проверка статуса авторизации...</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
