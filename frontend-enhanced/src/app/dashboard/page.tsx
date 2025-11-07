'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Shield,
  FileText,
  RefreshCw,
} from 'lucide-react';

type Health = { ok?: boolean; uptime?: number; [k: string]: unknown };
type OAuthStatus = {
  configured: boolean;
  googleConnected: boolean;
  [k: string]: unknown;
};
type ReportsLast = {
  lastNightly: string | null;
  lastStatus: string | null;
  [k: string]: unknown;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001';

export default function Dashboard() {
  // State для всех виджетов
  const [health, setHealth] = useState<Health | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);

  const [oauth, setOAuth] = useState<OAuthStatus | null>(null);
  const [oauthError, setOAuthError] = useState<string | null>(null);
  const [oauthLoading, setOAuthLoading] = useState<boolean>(false);

  const [reports, setReports] = useState<ReportsLast | null>(null);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [reportsLoading, setReportsLoading] = useState<boolean>(false);

  // Функции загрузки данных
  const fetchHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const res = await fetch(`${API_BASE}/health`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as Health;
      setHealth(json);
    } catch (e: unknown) {
      setHealth(null);
      setHealthError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchOAuthStatus = async () => {
    setOAuthLoading(true);
    setOAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/google/status`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as OAuthStatus;
      setOAuth(json);
    } catch (e: unknown) {
      setOAuth(null);
      setOAuthError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setOAuthLoading(false);
    }
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      const res = await fetch(`${API_BASE}/reports/last`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ReportsLast;
      setReports(json);
    } catch (e: unknown) {
      setReports(null);
      setReportsError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setReportsLoading(false);
    }
  };

  const refreshAll = () => {
    void Promise.all([fetchHealth(), fetchOAuthStatus(), fetchReports()]);
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    void Promise.all([fetchHealth(), fetchOAuthStatus(), fetchReports()]);
  }, []);

  // Вспомогательные функции для статус индикаторов
  const healthStatusOk = health?.ok === true;
  const healthUptime = health?.uptime ? Math.floor(health.uptime / 3600) : 0;

  const oauthConfigured = oauth?.configured === true;
  const oauthGoogleConnected = oauth?.googleConnected === true;
  const oauthStatusOk = oauthConfigured && oauthGoogleConnected;

  const reportsAvailable = reports?.lastNightly && reports?.lastStatus;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Панель управления
          </h1>
          <p className="text-slate-600">
            Обзор состояния системы Chef's Mind AI
          </p>
        </div>

        {/* Кнопка обновления */}
        <div className="mb-6">
          <button
            onClick={refreshAll}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Обновить все
          </button>
        </div>

        {/* Сетка виджетов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Health Widget */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Состояние сервера
              </h2>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    healthStatusOk ? 'bg-green-400' : 'bg-red-400'
                  }`}
                />
                <span className="text-sm font-medium text-slate-600">
                  {healthStatusOk ? 'Онлайн' : 'Оффлайн'}
                </span>
              </div>
            </div>

            {healthError ? (
              <div className="text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {healthError}
              </div>
            ) : healthLoading ? (
              <div className="text-slate-500 text-sm">Загрузка...</div>
            ) : health ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Аптайм</span>
                  <span className="font-medium">{healthUptime}ч</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Статус</span>
                  <span
                    className={`font-medium flex items-center gap-1 ${
                      healthStatusOk ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {healthStatusOk ? 'OK' : 'FAIL'}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* OAuth Status Widget */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                Google OAuth
              </h2>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    oauthStatusOk ? 'bg-green-400' : 'bg-amber-400'
                  }`}
                />
                <span className="text-sm font-medium text-slate-600">
                  {oauthStatusOk ? 'Подключен' : 'Частично'}
                </span>
              </div>
            </div>

            {oauthError ? (
              <div className="text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {oauthError}
              </div>
            ) : oauthLoading ? (
              <div className="text-slate-500 text-sm">Загрузка...</div>
            ) : oauth ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Конфигурация</span>
                  <span
                    className={`font-medium flex items-center gap-1 ${
                      oauthConfigured ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {oauthConfigured ? 'OK' : 'Нет'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Google</span>
                  <span
                    className={`font-medium flex items-center gap-1 ${
                      oauthGoogleConnected ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {oauthGoogleConnected ? 'Подключен' : 'Нет'}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Recent Reports Widget */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Последние отчёты
              </h2>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    reportsAvailable ? 'bg-green-400' : 'bg-slate-400'
                  }`}
                />
                <span className="text-sm font-medium text-slate-600">
                  {reportsAvailable ? 'Готово' : 'Нет данных'}
                </span>
              </div>
            </div>

            {reportsError ? (
              <div className="text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {reportsError}
              </div>
            ) : reportsLoading ? (
              <div className="text-slate-500 text-sm">Загрузка...</div>
            ) : reports ? (
              <div className="space-y-3">
                {reportsAvailable ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Nightly</span>
                      <span className="font-medium text-sm">
                        {reports.lastNightly
                          ? new Date(reports.lastNightly).toLocaleDateString(
                              'ru-RU'
                            )
                          : 'Нет данных'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Статус</span>
                      <span
                        className={`font-medium text-sm flex items-center gap-1 ${
                          reports.lastStatus?.includes('success') ||
                          reports.lastStatus?.includes('pass')
                            ? 'text-green-600'
                            : 'text-amber-600'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        {reports.lastStatus || 'Нет'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-500 text-sm">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Отчёты недоступны
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Информационная панель */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-indigo-900 mb-1">
                Система мониторинга
              </h3>
              <p className="text-indigo-700 text-sm leading-relaxed">
                Панель управления отображает текущее состояние ключевых
                компонентов системы. Данные обновляются автоматически и могут
                быть обновлены вручную. Для детальной диагностики перейдите на
                страницу{' '}
                <a
                  href="/status"
                  className="underline font-medium hover:text-indigo-800"
                >
                  статуса системы
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
