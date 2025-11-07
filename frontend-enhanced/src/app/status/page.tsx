'use client';

import React, { useEffect, useState } from 'react';
import { RBACGuard } from '../../components/RBACGuard';

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

export default function StatusPage() {
  // Health Widget State
  const [health, setHealth] = useState<Health | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);
  const [healthLastChecked, setHealthLastChecked] = useState<Date | null>(null);

  // OAuth Widget State
  const [oauth, setOAuth] = useState<OAuthStatus | null>(null);
  const [oauthError, setOAuthError] = useState<string | null>(null);
  const [oauthLoading, setOAuthLoading] = useState<boolean>(false);
  const [oauthLastChecked, setOAuthLastChecked] = useState<Date | null>(null);

  // Sheets Quotas Widget State
  const [sheetsQuotas, setSheetsQuotas] = useState<{
    total: number;
    used: number;
    percentage: number;
  } | null>(null);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [sheetsLoading, setSheetsLoading] = useState<boolean>(false);
  const [sheetsLastChecked, setSheetsLastChecked] = useState<Date | null>(null);

  // Nightly Reports Widget State
  const [nightly, setNightly] = useState<ReportsLast | null>(null);
  const [nightlyError, setNightlyError] = useState<string | null>(null);
  const [nightlyLoading, setNightlyLoading] = useState<boolean>(false);
  const [nightlyLastChecked, setNightlyLastChecked] = useState<Date | null>(
    null
  );

  const fetchHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const res = await fetch(`${API_BASE}/health`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
          `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`
        );
      }
      const json = (await res.json()) as Health;
      setHealth(json);
    } catch (e: unknown) {
      let message = 'Неизвестная ошибка';
      if (e instanceof Error) message = e.message;
      setHealth(null);
      setHealthError(message);
    } finally {
      setHealthLastChecked(new Date());
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
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
          `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`
        );
      }
      const json = (await res.json()) as OAuthStatus;
      setOAuth(json);
    } catch (e: unknown) {
      let message = 'Неизвестная ошибка';
      if (e instanceof Error) message = e.message;
      setOAuth(null);
      setOAuthError(message);
    } finally {
      setOAuthLastChecked(new Date());
      setOAuthLoading(false);
    }
  };

  const fetchSheetsQuotas = async () => {
    setSheetsLoading(true);
    setSheetsError(null);
    try {
      // Placeholder реализация - показываем мок данные
      await new Promise(resolve => setTimeout(resolve, 500)); // Имитация запроса
      setSheetsQuotas({
        total: 1000000,
        used: 234567,
        percentage: 23.5,
      });
    } catch (e: unknown) {
      let message = 'Неизвестная ошибка';
      if (e instanceof Error) message = e.message;
      setSheetsQuotas(null);
      setSheetsError(message);
    } finally {
      setSheetsLastChecked(new Date());
      setSheetsLoading(false);
    }
  };

  const fetchNightlyReports = async () => {
    setNightlyLoading(true);
    setNightlyError(null);
    try {
      const res = await fetch(`${API_BASE}/reports/last`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
          `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`
        );
      }
      const json = (await res.json()) as ReportsLast;
      setNightly(json);
    } catch (e: unknown) {
      let message = 'Неизвестная ошибка';
      if (e instanceof Error) message = e.message;
      setNightly(null);
      setNightlyError(message);
    } finally {
      setNightlyLastChecked(new Date());
      setNightlyLoading(false);
    }
  };

  useEffect(() => {
    // Load all widget data on component mount
    void Promise.all([
      fetchHealth(),
      fetchOAuthStatus(),
      fetchSheetsQuotas(),
      fetchNightlyReports(),
    ]);
  }, []);

  const refreshAll = () => {
    void Promise.all([
      fetchHealth(),
      fetchOAuthStatus(),
      fetchSheetsQuotas(),
      fetchNightlyReports(),
    ]);
  };

  // Health Widget helpers
  const healthStatusOk = health?.ok === true;
  const healthIndicatorColor = healthStatusOk ? '#16a34a' : '#dc2626';
  const healthIndicatorLabel = healthStatusOk ? 'OK' : 'FAIL';

  // OAuth Widget helpers
  const oauthConfigured = oauth?.configured === true;
  const oauthGoogleConnected = oauth?.googleConnected === true;
  const oauthIndicatorColor =
    oauthConfigured && oauthGoogleConnected ? '#16a34a' : '#f59e0b';
  const oauthIndicatorLabel =
    oauthConfigured && oauthGoogleConnected ? 'Connected' : 'Partial';

  // Sheets Widget helpers
  const sheetsPercentage = sheetsQuotas?.percentage ?? 0;
  const sheetsIndicatorColor =
    sheetsPercentage < 80
      ? '#16a34a'
      : sheetsPercentage < 95
        ? '#f59e0b'
        : '#dc2626';
  const sheetsIndicatorLabel = `${sheetsPercentage.toFixed(1)}% used`;

  // Nightly Widget helpers
  const nightlyHasData = nightly?.lastNightly && nightly?.lastStatus;
  const nightlyIndicatorColor = nightlyHasData ? '#16a34a' : '#6b7280';
  const nightlyIndicatorLabel = nightlyHasData ? 'Available' : 'Unknown';

  const cardStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 16,
    background: '#ffffff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    marginBottom: 16,
  };

  const buttonStyle: React.CSSProperties = {
    background: '#1f2937',
    color: '#ffffff',
    border: 0,
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 14,
  };

  const refreshButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    fontSize: 12,
    padding: '6px 10px',
  };

  const codeStyle: React.CSSProperties = {
    background: '#0b1220',
    color: '#e5e7eb',
    padding: '12px',
    borderRadius: 8,
    overflowX: 'auto',
    fontSize: 12,
    lineHeight: 1.4,
    marginTop: 8,
  };

  const renderStatusIndicator = (ok: boolean, label: string) => (
    <span
      aria-label={`Статус: ${label}`}
      title={label}
      style={{
        display: 'inline-block',
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: ok ? '#16a34a' : '#dc2626',
        boxShadow: '0 0 0 2px rgba(0,0,0,0.05)',
      }}
    />
  );

  const renderWidget = (
    title: string,
    indicator: React.ReactNode,
    content: React.ReactNode,
    onRefresh?: () => void,
    loading?: boolean,
    lastChecked?: Date | null
  ) => (
    <section style={cardStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {indicator}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              style={refreshButtonStyle}
            >
              {loading ? 'Загрузка...' : 'Обновить'}
            </button>
          )}
        </div>
      </div>
      {content}
      {lastChecked && (
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>
          Последняя проверка: {lastChecked.toLocaleString()}
        </div>
      )}
    </section>
  );

  return (
    <RBACGuard allowedRoles={['admin']}>
      <main
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
            Статус системы
          </h1>
          <button onClick={refreshAll} style={buttonStyle}>
            Обновить все
          </button>
        </div>

        {/* Health Widget */}
        {renderWidget(
          'Соединение с сервером',
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {renderStatusIndicator(healthStatusOk, healthIndicatorLabel)}
            <strong>{healthIndicatorLabel}</strong>
          </div>,
          healthError ? (
            <div
              role="alert"
              style={{
                background: '#fef2f2',
                color: '#991b1b',
                padding: '12px',
                borderRadius: 8,
                border: '1px solid #fecaca',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>Ошибка проверки</p>
              <p style={{ margin: '4px 0 0 0', fontSize: 12 }}>{healthError}</p>
            </div>
          ) : (
            <pre style={codeStyle}>{JSON.stringify(health ?? {}, null, 2)}</pre>
          ),
          fetchHealth,
          healthLoading,
          healthLastChecked
        )}

        {/* OAuth Widget */}
        {renderWidget(
          'Google OAuth интеграция',
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: oauthIndicatorColor,
              }}
            />
            <strong>{oauthIndicatorLabel}</strong>
          </div>,
          oauthError ? (
            <div
              role="alert"
              style={{
                background: '#fef2f2',
                color: '#991b1b',
                padding: '12px',
                borderRadius: 8,
                border: '1px solid #fecaca',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>
                Ошибка проверки OAuth
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: 12 }}>{oauthError}</p>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    Конфигурация
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {oauthConfigured ? '✅ Настроен' : '❌ Не настроен'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    Google подключение
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {oauthGoogleConnected ? '✅ Подключен' : '❌ Не подключен'}
                  </div>
                </div>
              </div>
              <pre style={codeStyle}>
                {JSON.stringify(oauth ?? {}, null, 2)}
              </pre>
            </div>
          ),
          fetchOAuthStatus,
          oauthLoading,
          oauthLastChecked
        )}

        {/* Sheets Quotas Widget */}
        {renderWidget(
          'Google Sheets квоты',
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: sheetsIndicatorColor,
              }}
            />
            <strong>{sheetsIndicatorLabel}</strong>
          </div>,
          sheetsError ? (
            <div
              role="alert"
              style={{
                background: '#fef2f2',
                color: '#991b1b',
                padding: '12px',
                borderRadius: 8,
                border: '1px solid #fecaca',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>Ошибка проверки квот</p>
              <p style={{ margin: '4px 0 0 0', fontSize: 12 }}>{sheetsError}</p>
            </div>
          ) : (
            <div>
              {sheetsQuotas ? (
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: 16,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        Использовано
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {sheetsQuotas.used.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        Лимит
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {sheetsQuotas.total.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        Процент
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {sheetsPercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      background: '#e5e7eb',
                      height: 8,
                      borderRadius: 4,
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(sheetsPercentage, 100)}%`,
                        height: '100%',
                        backgroundColor: sheetsIndicatorColor,
                        borderRadius: 4,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  Данные о квотах недоступны
                </p>
              )}
              <p style={{ fontSize: 12, color: '#6b7280' }}>
                Примечание: Интеграция с Google Sheets API планируется в будущих
                версиях
              </p>
            </div>
          ),
          fetchSheetsQuotas,
          sheetsLoading,
          sheetsLastChecked
        )}

        {/* Nightly Reports Widget */}
        {renderWidget(
          'Последний nightly отчёт',
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: nightlyIndicatorColor,
              }}
            />
            <strong>{nightlyIndicatorLabel}</strong>
          </div>,
          nightlyError ? (
            <div
              role="alert"
              style={{
                background: '#fef2f2',
                color: '#991b1b',
                padding: '12px',
                borderRadius: 8,
                border: '1px solid #fecaca',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>
                Ошибка загрузки отчётов
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: 12 }}>
                {nightlyError}
              </p>
            </div>
          ) : (
            <div>
              {nightlyHasData ? (
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 16,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        Последний nightly
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {nightly.lastNightly}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        Статус
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {nightly.lastStatus}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={() =>
                        window.open(
                          '/reports/nightly_status_latest.md',
                          '_blank'
                        )
                      }
                      style={{ ...refreshButtonStyle, background: '#059669' }}
                    >
                      Открыть отчёт
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  Данные о nightly отчётах недоступны
                </p>
              )}
              <p style={{ fontSize: 12, color: '#6b7280' }}>
                Примечание: Nightly отчёты создаются автоматически через GitHub
                Actions
              </p>
            </div>
          ),
          fetchNightlyReports,
          nightlyLoading,
          nightlyLastChecked
        )}

        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: '#f9fafb',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px 0' }}>
            О системе мониторинга
          </h3>
          <p style={{ fontSize: 12, margin: 0, color: '#6b7280' }}>
            Status Dashboard отображает текущее состояние ключевых компонентов
            системы Chef's Mind AI. Обновление происходит автоматически при
            загрузке страницы и вручную по нажатию кнопок. Для получения
            детальной информации обращайтесь к документации и отчётам.
          </p>
        </div>
      </main>
    </RBACGuard>
  );
}
