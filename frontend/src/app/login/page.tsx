'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { API_URL } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMessage(''); setBusy(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) { setMessage(data.message || 'Login failed.'); return; }
      localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user));
      router.push(data.user.role === 'admin' ? '/admin' : '/');
    } catch { setMessage('Could not connect to the server.'); }
    finally { setBusy(false); }
  }

  return <main className="app-bg grid min-h-screen place-items-center p-5"><div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-900/10 md:grid-cols-2"><section className="relative hidden overflow-hidden bg-[#14213d] p-10 text-white md:flex md:flex-col md:justify-between"><div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[45px] border-white/5"/><div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"/><Link href="/" className="relative flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500 text-xl">▤</span><span className="text-lg font-extrabold">Page & Pine</span></Link><div className="relative"><p className="eyebrow !text-blue-300">Welcome back</p><h1 className="mt-4 text-4xl font-black leading-tight">Your next chapter is waiting.</h1><p className="mt-4 max-w-sm leading-7 text-slate-300">Sign in to continue exploring your digital library and keep your reading close.</p></div><p className="relative text-xs text-slate-400">A quieter corner of the internet, made for reading.</p></section><section className="p-7 sm:p-10 md:p-12"><Link href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to library</Link><p className="eyebrow mt-9">Member access</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#14213d]">Sign in</h2><p className="mt-2 text-sm leading-6 text-slate-500">Enter your account details below.</p><form onSubmit={handleLogin} className="mt-8 space-y-5"><div><label className="field-label" htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="you@example.com" /></div><div><label className="field-label" htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" placeholder="Enter your password" /></div>{message && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}<button disabled={busy} type="submit" className="btn-primary w-full disabled:opacity-60">{busy ? 'Signing in…' : 'Sign in to your account'} <span>→</span></button></form><p className="mt-7 text-center text-sm text-slate-500">New to Page & Pine? <Link href="/register" className="font-bold text-blue-700 hover:underline">Create an account</Link></p></section></div></main>;
}
