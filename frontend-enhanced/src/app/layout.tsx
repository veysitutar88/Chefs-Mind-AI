// c:\Projects\Chefs-Mind-AI\frontend-enhanced\src\app\layout.tsx
// layout.tsx — финальная разметка с брендовым бэкграундом
import '../styles/globals.css';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

export const metadata = {
  title: "Chef's Mind AI - Управление рестораном",
  description:
    'Многоагентная ИИ‑платформа для управления рестораном с 5 специализированными агентами',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gradient-fine">
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
