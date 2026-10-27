'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Poster } from '@/lib/data';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import Modal from './Modal';
import PosterArt from './PosterArt';

interface ManagedPoster extends Poster {
  id: string;
}

const adminEmail = process.env.NEXT_PUBLIC_SUPABASE_ADMIN_EMAIL?.trim().toLowerCase() ?? '';
export default function Posters() {
  const [user, setUser] = useState<User | null>(null);
  const [posters, setPosters] = useState<ManagedPoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);
  const [selected, setSelected] = useState<ManagedPoster | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [kind, setKind] = useState('');
  const [brand, setBrand] = useState('');
  const [line, setLine] = useState('');
  const [details, setDetails] = useState('');
  const [bg, setBg] = useState('#7743dc');
  const [fg, setFg] = useState('#ffffff');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const isAdmin = !!adminEmail && user?.email?.trim().toLowerCase() === adminEmail;

  useEffect(() => {
    const hasAdminAccess = new URLSearchParams(window.location.search).get('admin') === '1';
    setAdminAccess(hasAdminAccess);
    setAdminOpen(hasAdminAccess);
  }, []);

  const refreshPosters = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      setError('Supabase is not configured. Set its URL, publishable key, and admin email in .env.local.');
      return;
    }
    const { data, error: loadError } = await supabase
      .from('portfolio_posters')
      .select('id, kind, brand, line, details, bg, fg')
      .order('created_at', { ascending: false });
    if (loadError) {
      setError(`Could not load posters: ${loadError.message}. Run the latest supabase/setup.sql in this Supabase project.`);
    } else {
      setPosters(data ?? []);
      setError('');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      void refreshPosters();
      return;
    }
    let active = true;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(`Could not check admin sign-in: ${sessionError.message}`);
      setUser(data.session?.user ?? null);
      void refreshPosters();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshPosters]);

  function resetForm() {
    setEditingId(null);
    setKind('');
    setBrand('');
    setLine('');
    setDetails('');
    setBg('#7743dc');
    setFg('#ffffff');
  }

  function editPoster(poster: ManagedPoster) {
    setEditingId(poster.id);
    setKind(poster.kind);
    setBrand(poster.brand);
    setLine(poster.line);
    setDetails(poster.details ?? '');
    setBg(poster.bg);
    setFg(poster.fg);
    setAdminOpen(true);
  }

  async function submitPoster(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !isAdmin) {
      setError('Sign in with the configured admin account to manage posters.');
      return;
    }
    setBusy(true);
    setError('');
    setStatus('');
    const poster = {
      kind: kind.trim(),
      brand: brand.trim(),
      line: line.trim(),
      details: details.trim(),
      bg,
      fg,
    };
    const result = editingId
      ? await supabase.from('portfolio_posters').update(poster).eq('id', editingId)
      : await supabase.from('portfolio_posters').insert(poster);
    setBusy(false);
    if (result.error) {
      setError(`Could not ${editingId ? 'update' : 'add'} poster: ${result.error.message}. Confirm the poster table policies are installed.`);
      return;
    }
    resetForm();
    setStatus(editingId ? 'Poster updated.' : 'Poster added.');
    await refreshPosters();
  }

  async function deletePoster(poster: ManagedPoster) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !isAdmin) {
      setError('Sign in with the configured admin account to delete posters.');
      return;
    }
    if (!window.confirm(`Delete the “${poster.kind}” poster for ${poster.brand}?`)) return;
    setBusy(true);
    setError('');
    setStatus('');
    const { error: deleteError } = await supabase.from('portfolio_posters').delete().eq('id', poster.id);
    setBusy(false);
    if (deleteError) {
      setError(`Could not delete poster: ${deleteError.message}`);
      return;
    }
    if (selected?.id === poster.id) setSelected(null);
    setStatus('Poster deleted.');
    await refreshPosters();
  }

  async function requestSignIn() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !adminEmail) {
      setError('Set the Supabase URL, publishable key, and admin email in .env.local.');
      return;
    }
    setBusy(true);
    setError('');
    setStatus('');
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: adminEmail,
      options: { emailRedirectTo: `${window.location.origin}/smm?admin=1` },
    });
    setBusy(false);
    if (signInError) setError(`Could not send the sign-in link: ${signInError.message}`);
    else setStatus(`A sign-in link was sent to ${adminEmail}.`);
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(`Could not sign out: ${signOutError.message}`);
    else {
      setUser(null);
      setStatus('Signed out.');
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs text-mu">{loading ? 'Loading posters…' : `${posters.length} poster${posters.length === 1 ? '' : 's'}`}</p>
        {(adminAccess || isAdmin) && (
          <button type="button" className="ulink font-mono text-xs text-ac" aria-expanded={adminOpen} onClick={() => setAdminOpen((open) => !open)}>
            {adminOpen ? 'Close admin' : 'Admin tools'}
          </button>
        )}
      </div>
      {adminOpen && (adminAccess || isAdmin) && (
        <div className="mb-6 space-y-4 rounded-2xl border border-ac/15 bg-soft/50 p-5">
          {isAdmin ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xs text-mu">Admin: {user?.email}</p>
                <div className="flex gap-4">
                  <button type="button" className="ulink font-mono text-xs text-ac" onClick={resetForm}>New poster</button>
                  <button type="button" className="ulink font-mono text-xs text-ac" onClick={() => void signOut()}>Sign out</button>
                </div>
              </div>
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => void submitPoster(event)}>
                <label className="space-y-1 text-xs text-mu">Poster category
                  <input value={kind} onChange={(event) => setKind(event.target.value)} maxLength={60} required placeholder="Product launch" className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
                </label>
                <label className="space-y-1 text-xs text-mu">Brand / account
                  <input value={brand} onChange={(event) => setBrand(event.target.value)} maxLength={80} required placeholder="Brand name" className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
                </label>
                <label className="space-y-1 text-xs text-mu sm:col-span-2">Main poster text
                  <textarea value={line} onChange={(event) => setLine(event.target.value)} maxLength={180} required rows={2} placeholder="Write the main headline shown on the poster" className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
                </label>
                <label className="space-y-1 text-xs text-mu sm:col-span-2">Supporting details
                  <textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={240} rows={2} placeholder="Optional supporting line or offer details" className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
                </label>
                <label className="flex items-center gap-3 text-xs text-mu">Background color
                  <input type="color" value={bg} onChange={(event) => setBg(event.target.value)} className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent" />
                </label>
                <label className="flex items-center gap-3 text-xs text-mu">Text and accent color
                  <input type="color" value={fg} onChange={(event) => setFg(event.target.value)} className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent" />
                </label>
                <div className="flex gap-4 sm:col-span-2">
                  <button type="submit" className="cta text-sm" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save poster changes' : 'Add poster'}</button>
                  {editingId && <button type="button" className="ulink font-mono text-xs text-mu" onClick={resetForm}>Cancel edit</button>}
                </div>
              </form>
            </>
          ) : user ? (
            <p className="text-sm text-mu">Signed in as {user.email}; this account is not the configured admin.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-mu">{adminEmail ? `Sign in as ${adminEmail} to add, edit, or delete posters.` : 'Configure the admin email in .env.local to manage posters.'}</p>
              <button type="button" className="cta text-sm" disabled={busy} onClick={() => void requestSignIn()}>{busy ? 'Sending link…' : 'Send admin sign-in link'}</button>
            </div>
          )}
          {error && <p role="alert" className="rounded-xl bg-bg p-3 text-sm text-ac">{error}</p>}
          {status && <p role="status" className="text-sm text-mu">{status}</p>}
        </div>
      )}
      {!adminOpen && (error || status) && <p role={error ? 'alert' : 'status'} className="mb-5 text-sm text-mu">{error || status}</p>}
      {posters.length ? (
        <div className="columns-2 gap-4 md:columns-3">
          {posters.map((poster, n) => (
            <article key={poster.id} className="relative mb-4 break-inside-avoid">
              <button type="button" onClick={() => setSelected(poster)} aria-label={`Enlarge poster: ${poster.kind}`} className="block w-full text-left transition duration-300 hover:-rotate-1 hover:scale-[1.03]">
                <PosterArt poster={poster} minHeight={`${11 + (n % 3) * 4}rem`} />
              </button>
              {isAdmin && (
                <div className="absolute right-2 top-2 z-10 flex gap-2 rounded-full bg-bg/95 p-1 shadow">
                  <button type="button" onClick={() => editPoster(poster)} disabled={busy} className="rounded-full px-3 py-2 font-mono text-xs text-ac hover:bg-soft">Edit</button>
                  <button type="button" onClick={() => void deletePoster(poster)} disabled={busy} className="rounded-full bg-red-700 px-3 py-2 font-mono text-xs text-white hover:bg-red-800">Delete</button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-soft/70 p-5 text-sm text-mu">{loading ? 'Loading posters…' : 'No posters yet. Sign in as admin and add your first poster.'}</p>
      )}
      <Modal open={selected !== null} onClose={() => setSelected(null)} label="Poster preview">
        {selected && (
          <>
            <h2 className="mb-4 font-display text-xl text-ac">{selected.kind} poster</h2>
            <PosterArt poster={selected} minHeight="60vh" />
          </>
        )}
      </Modal>
    </>
  );
}
