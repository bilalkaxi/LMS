'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { API_URL } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMessage(''); setBusy(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
      const data = await response.json();
      if (!response.ok) { setMessage(data.message || 'Registration failed.'); return; }
      router.push('/login?registered=1');
    } catch { setMessage('Could not connect to the server.'); }
    finally { setBusy(false); }
  }
  return <main className="app-bg grid min-h-screen place-items-center p-5"><div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-900/10 sm:p-10"><Link href="/" className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#14213d] text-xl text-white">▤</span><span><span className="block font-extrabold text-[#14213d]">Page & Pine</span><span className="block text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">Digital library</span></span></Link><p className="eyebrow mt-9">Start your reading journey</p><h1 className="mt-2 text-3xl font-black tracking-tight text-[#14213d]">Create your account</h1><p className="mt-2 text-sm leading-6 text-slate-500">Create an account to make your library experience yours.</p><form onSubmit={handleRegister} className="mt-7 space-y-5"><div><label className="field-label" htmlFor="name">Full name</label><input id="name" autoComplete="name" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="Your name" /></div><div><label className="field-label" htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="you@example.com" /></div><div><label className="field-label" htmlFor="password">Password</label><input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className="field" placeholder="At least 8 characters" /><p className="mt-2 text-xs text-slate-400">Use at least 8 characters.</p></div>{message && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}<button disabled={busy} className="btn-primary w-full disabled:opacity-60" type="submit">{busy ? 'Creating account…' : 'Create account'} <span>→</span></button></form><p className="mt-7 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-bold text-blue-700 hover:underline">Sign in</Link></p></div></main>;
}
