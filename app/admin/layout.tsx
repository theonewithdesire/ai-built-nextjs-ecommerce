'use client';

import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // For login page, return children directly without any wrapper
  if (isLoginPage) {
    return children;
  }

  // For other admin pages, wrap with a minimal admin layout
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 