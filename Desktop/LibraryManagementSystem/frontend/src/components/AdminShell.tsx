'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const links = [
  { href: '/admin', label: 'Overview', icon: '▦' },
  { href: '/admin/books', label: 'Books', icon: '▤' },
  { href: '/admin/authors', label: 'Authors', icon: '✎' },
  { href: '/admin/categories', label: 'Categories', icon: '◈' },
  { href: '/admin/history', label: 'Download history', icon: '↧' },
];

export default function AdminShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('Administrator');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');
    if (!token || !rawUser) { router.replace('/login'); return; }
    try {
      const user = JSON.parse(rawUser);
      if (user.role !== 'admin') { router.replace('/'); return; }
      setName(user.name || 'Administrator');
      setReady(true);
    } catch { localStorage.removeItem('token'); localStorage.removeItem('user'); router.replace('/login'); }
  }, [router]);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  if (!ready) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Checking administrator access…</div>;

  return <div className="admin-layout">
    <aside className="admin-sidebar">
      <Link href="/" className="flex items-center gap-3 px-3 pb-7">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500 text-xl text-white">▤</span>
        <span><span className="block text-lg font-bold tracking-tight text-white">Page & Pine</span><span className="text-xs text-slate-400">LIBRARY ADMIN</span></span>
      </Link>
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Workspace</p>
      <nav className="admin-sidebar-nav space-y-1">
        {links.map((link) => <Link key={link.href} href={link.href} className={`admin-nav-link ${pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href)) ? 'active' : ''}`}><span className="w-5 text-center text-base">{link.icon}</span>{link.label}</Link>)}
      </nav>
      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold text-white">Need the public view?</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">Visit the library to browse and download titles.</p>
        <Link href="/" className="mt-3 inline-block text-sm font-semibold text-blue-300 hover:text-white">Open library →</Link>
      </div>
      <button onClick={logout} className="mt-6 w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white">↪ Sign out</button>
    </aside>
    <div className="min-w-0">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/80 px-6 py-5 backdrop-blur md:px-10">
        <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-slate-400">Library workspace</p><h1 className="mt-1 text-xl font-bold text-slate-900">{title}</h1></div>
        <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-800">{name}</p><p className="text-xs text-slate-500">Administrator</p></div><div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">{name.slice(0, 1).toUpperCase()}</div></div>
      </header>
      <main className="p-5 md:p-10"><div className="mx-auto max-w-6xl"><div className="mb-7">{subtitle && <p className="muted max-w-2xl text-sm leading-6">{subtitle}</p>}</div>{children}</div></main>
    </div>
  </div>;
}
