import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-accent/30 selection:text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}
