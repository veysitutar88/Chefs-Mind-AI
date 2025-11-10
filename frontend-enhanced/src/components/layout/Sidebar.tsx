'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/agents', label: 'Agents' },
  { href: '/media', label: 'Media' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="p-4 space-y-1">
      {items.map(it => {
        const active = pathname?.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`block px-3 py-2 rounded-md border ${
              active
                ? 'bg-brand-blue text-white border-brand'
                : 'text-white/80 border-transparent hover:border-brand hover:bg-brand-blue/10'
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
