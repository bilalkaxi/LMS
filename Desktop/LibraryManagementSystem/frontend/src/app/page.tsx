'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { API_URL } from '../lib/api';

type Book = { id: number; title: string; description: string | null; isbn: string | null; author: string | null; category: string | null };

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/books`).then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: Book[]) => setBooks(data)).catch(() => setError('We could not reach the library service. Make sure the backend is running.'))
      .finally(() => setLoading(false));
    const raw = localStorage.getItem('user');
    if (raw) { try { setUser(JSON.parse(raw)); } catch { localStorage.removeItem('user'); } }
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(books.map((b) => b.category).filter(Boolean) as string[])).sort()], [books]);
  const filtered = useMemo(() => books.filter((book) => {
    const term = search.toLowerCase().trim();
    const matchesSearch = `${book.title} ${book.author || ''} ${book.category || ''} ${book.description || ''}`.toLowerCase().includes(term);
    return matchesSearch && (category === 'All' || book.category === category);
  }), [books, search, category]);

  async function downloadBook(book: Book) {
    setDownloading(book.id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/books/${book.id}/download`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.message || 'Download failed'); }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${book.title.replace(/[\\/:*?"<>|]/g, '_')}.pdf`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e) { setError(e instanceof Error ? e.message : 'Download failed'); }
    finally { setDownloading(null); }
  }

  function logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); }

  return <main className="app-bg min-h-screen text-slate-900">
    <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">
      <Link href="/" className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#14213d] text-xl text-white shadow-lg shadow-slate-900/10">▤</span><span><span className="block text-lg font-extrabold tracking-tight">Page & Pine</span><span className="block text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">Digital library</span></span></Link>
      <div className="flex items-center gap-2 sm:gap-3">{user?.role === 'admin' && <Link href="/admin" className="btn-secondary hidden sm:inline-flex">Admin workspace</Link>}{user && <Link href="/history" className="btn-secondary hidden sm:inline-flex">My downloads</Link>}{user ? <><span className="hidden text-sm font-semibold text-slate-600 md:inline">Hi, {user.name}</span><button onClick={logout} className="btn-secondary">Sign out</button></> : <><Link href="/login" className="btn-secondary">Sign in</Link><Link href="/register" className="btn-primary">Create account</Link></>}</div>
    </nav>

    <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-6 md:grid-cols-[1.05fr_.95fr] md:items-center md:px-8 md:pb-16 md:pt-10">
      <div><span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold text-blue-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> YOUR NEXT CHAPTER STARTS HERE</span><h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-[#14213d] sm:text-5xl md:text-6xl">A little more <span className="text-[#2855d9]">wonder.</span><br />A lot more reading.</h1><p className="mt-5 max-w-xl text-base leading-7 text-slate-500 md:text-lg">Explore a growing collection of books, find your next favorite, and keep your learning close at hand.</p><a href="#collection" className="btn-primary mt-7">Explore the collection <span aria-hidden>→</span></a><div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500"><span><strong className="text-slate-900">{books.length}</strong> titles to explore</span><span><strong className="text-slate-900">{categories.length - 1}</strong> categories</span><span><strong className="text-slate-900">PDF</strong> downloads</span></div></div>
      <div className="relative mx-auto w-full max-w-lg"><div className="absolute -inset-5 rounded-[34px] bg-blue-200/30 blur-2xl"/><div className="relative overflow-hidden rounded-[28px] bg-[#14213d] p-7 text-white shadow-2xl shadow-blue-950/15 md:p-9"><div className="absolute -right-12 -top-16 h-56 w-56 rounded-full border-[34px] border-white/5"/><div className="absolute -bottom-20 right-14 h-48 w-48 rounded-full bg-blue-500/20 blur-2xl"/><p className="relative text-xs font-bold uppercase tracking-[.2em] text-blue-200">The reading room</p><div className="relative mt-7 flex items-end justify-center gap-3">{[['#d3a56c','h-40'],['#6b8cdd','h-52'],['#e7eaf1','h-44'],['#b4c7a3','h-48']].map(([color,height],i)=><div key={i} className={`${height} w-[21%] rounded-t-lg shadow-lg`} style={{background:color, transform:`rotate(${i===0?-4:i===3?4:0}deg)`}}><div className="h-full border-l-4 border-black/10 p-2"><div className="mt-6 h-1 w-4/5 rounded bg-black/15"/><div className="mt-2 h-1 w-3/5 rounded bg-black/10"/><div className="mt-12 h-px w-full bg-black/10"/></div></div>)}</div><div className="relative mt-7 border-t border-white/15 pt-5"><p className="text-lg font-bold">Make space for a good story.</p><p className="mt-1 text-sm text-slate-300">A thoughtful collection, ready whenever you are.</p></div></div></div>
    </section>

    <section id="collection" className="mx-auto max-w-7xl px-5 pb-20 md:px-8"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Find your next read</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#14213d] sm:text-3xl">Explore the collection</h2><p className="mt-2 text-sm text-slate-500">Search by title, author, or topic.</p></div><div className="w-full sm:max-w-sm"><label htmlFor="book-search" className="sr-only">Search books</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span><input id="book-search" className="field pl-10" placeholder="Search the library…" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div></div>
      <div className="mb-7 flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${category === item ? 'bg-[#14213d] text-white shadow' : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700'}`}>{item}</button>)}</div>
      {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
      {loading ? <div className="panel p-10 text-center text-slate-500">Loading the collection…</div> : filtered.length === 0 ? <div className="panel px-6 py-16 text-center"><span className="text-4xl">⌕</span><h3 className="mt-4 text-lg font-bold">No books found</h3><p className="mt-2 text-sm text-slate-500">Try another search or choose a different category.</p><button className="btn-secondary mt-5" onClick={() => { setSearch(''); setCategory('All'); }}>Clear filters</button></div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((book, i) => <article key={book.id} className="panel group flex min-h-[245px] flex-col p-5 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5"><div className="flex gap-4"><div className="book-cover" style={{background: ['linear-gradient(145deg,#2855d9,#7394f5)','linear-gradient(145deg,#b56b3b,#e6b47d)','linear-gradient(145deg,#257a70,#71b8a5)','linear-gradient(145deg,#6741a5,#a58be0)'][i%4]}}><span className="text-xl">▤</span></div><div className="min-w-0 flex-1"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">{book.category || 'General'}</span><h3 className="mt-3 line-clamp-2 text-lg font-extrabold leading-snug text-[#14213d]">{book.title}</h3><p className="mt-1 text-sm text-slate-500">by {book.author || 'Unknown author'}</p></div></div><p className="mt-5 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">{book.description || 'A new addition to the collection. Download the PDF to start reading.'}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs font-semibold text-slate-400">PDF · Digital edition</span><button onClick={() => downloadBook(book)} disabled={downloading === book.id} className="btn-primary px-3 py-2 text-sm disabled:cursor-wait disabled:opacity-60">{downloading === book.id ? 'Preparing…' : '↓ Download'}</button></div></article>)}</div>}
    </section>
    <footer className="border-t border-slate-200 bg-white/70 px-5 py-7 text-center text-xs text-slate-400">© {new Date().getFullYear()} Page & Pine Digital Library · Built for curious minds.</footer>
  </main>;
}
