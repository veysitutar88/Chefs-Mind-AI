import "../styles/globals.css";
export const metadata = {
  title: "Chef's Mind — Enhanced Console",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  );
}