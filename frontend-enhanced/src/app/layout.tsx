import '@/styles/globals.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

export const metadata = {
  title: "Chef's Mind AI - Управление рестораном",
  description:
    'Многоагентная ИИ-платформа для управления рестораном с 5 специализированными агентами',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="h-full">
      <body className="h-full">
        <div className="h-full grid grid-rows-[auto_1fr]">
          <Header />
          <div className="grid grid-cols-[240px_1fr] min-h-0">
            <Sidebar />
            <main className="overflow-auto p-4">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
