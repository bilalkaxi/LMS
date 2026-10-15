'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL, authHeaders } from '../../lib/api';

type Entry = { id: number; book_title: string; downloaded_at: string };

export default function MyDownloadHistory() {
  const router = useRouter();
  const [items, setItems] = useState<Entry[]>([]);
  const [message, setMessage] = useState('Loading your history…');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.replace('/login'); return; }
    fetch(`${API_URL}/history/my`, { headers: authHeaders() })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Could not load history'); return data; })
      .then((data: Entry[]) => { setItems(data); setMessage(data.length ? '' : 'Your downloads will appear here after you download a book while signed in.'); })
      .catch((error) => setMessage(error.message || 'Could not connect to the server.'));
  }, [router]);

  return <main className="app-bg min-h-screen px-5 py-8 md:px-8"><div className="mx-auto max-w-4xl"><Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#14213d] text-lg text-white">▤</span><span className="font-extrabold text-[#14213d]">Page & Pine</span></Link><div className="mb-7 mt-10"><p className="eyebrow">Your account</p><h1 className="mt-2 text-3xl font-black tracking-tight text-[#14213d]">My downloads</h1><p className="mt-2 text-sm text-slate-500">A list of PDFs you downloaded while signed in.</p></div><section className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-5"><h2 className="font-extrabold text-[#14213d]">Download history</h2><Link href="/" className="text-sm font-bold text-blue-700 hover:text-blue-900">Browse books →</Link></div>{message && <p className="p-6 text-sm text-slate-500">{message}</p>}{items.length > 0 && <div className="divide-y divide-slate-100">{items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="flex items-center gap-3"><span className="book-cover !h-11 !w-10">↓</span><p className="font-bold text-slate-800">{item.book_title}</p></div><time className="text-xs text-slate-400">{new Date(item.downloaded_at).toLocaleString()}</time></div>)}</div>}</section></div></main>;
}
