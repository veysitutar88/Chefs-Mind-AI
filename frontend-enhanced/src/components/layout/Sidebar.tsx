import React from 'react';
import Link from 'next/link';

const Sidebar = () => (
  <aside className="bg-gray-100 p-4 border-r">
    <nav>
      <ul className="space-y-2">
        <li>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/agents" className="text-blue-600 hover:underline">
            Agents
          </Link>
        </li>
        <li>
          <Link href="/media" className="text-blue-600 hover:underline">
            Media
          </Link>
        </li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;
