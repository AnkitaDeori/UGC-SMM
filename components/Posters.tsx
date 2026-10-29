'use client';
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Poster } from '@/lib/data';
import { getSupabaseBrowserClient, MEDIA_BUCKET } from '@/lib/supabase';
import Modal from './Modal';
import PosterArt from './PosterArt';

interface ManagedPoster extends Poster {
  id: string;
  imagePath: string | null;
  imageUrl: string | null;
}

const posterImageTypes: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const isAdmin = !!adminEmail && user?.email?.trim().toLowerCase() === adminEmail;

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

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
      .select('id, kind, brand, line, details, bg, fg, image_path')
      .order('created_at', { ascending: false });
    if (loadError) {
      setError(`Could not load posters: ${loadError.message}. Run the latest supabase/setup.sql in this Supabase project.`);
    } else {
      setPosters((data ?? []).map((poster) => ({
        ...poster,
        imagePath: poster.image_path,
        imageUrl: poster.image_path
          ? supabase.storage.from(MEDIA_BUCKET).getPublicUrl(poster.image_path).data.publicUrl
          : null,
      })));
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
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser?.email?.trim().toLowerCase() === adminEmail) {
        setAdminAccess(true);
        setAdminOpen(true);
      } else if (!sessionUser) {
        const hasAdminAccess = new URLSearchParams(window.location.search).get('admin') === '1';
        setAdminAccess(hasAdminAccess);
        setAdminOpen(hasAdminAccess);
      }
      void refreshPosters();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser?.email?.trim().toLowerCase() === adminEmail) {
        setAdminAccess(true);
        setAdminOpen(true);
      } else if (!sessionUser) {
        const hasAdminAccess = new URLSearchParams(window.location.search).get('admin') === '1';
        setAdminAccess(hasAdminAccess);
        setAdminOpen(hasAdminAccess);
      }
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
    setImageFile(null);
  }

  function editPoster(poster: ManagedPoster) {
    setEditingId(poster.id);
    setKind(poster.kind);
    setBrand(poster.brand);
    setLine(poster.line);
    setDetails(poster.details ?? '');
    setBg(poster.bg);
    setFg(poster.fg);
    setImageFile(null);
    setAdminOpen(true);
  }

  function choosePosterImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = '';
    if (!file) return;
    if (!posterImageTypes[file.type]) {
      setError('Choose a JPG, PNG, WebP, GIF, or AVIF poster image.');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('Poster images must be 100 MB or smaller.');
      return;
    }
    setImageFile(file);
    setError('');
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
    let uploadedImagePath: string | null = null;
    if (imageFile) {
      uploadedImagePath = `posters/${crypto.randomUUID()}.${posterImageTypes[imageFile.type]}`;
      const { error: imageUploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(uploadedImagePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });
      if (imageUploadError) {
        setBusy(false);
        setError(`Could not upload poster image: ${imageUploadError.message}. Check that the Storage policies in supabase/setup.sql are installed for the configured admin email.`);
        return;
      }
    }
    const existingPoster = editingId ? posters.find((poster) => poster.id === editingId) : undefined;
    const poster = {
      kind: kind.trim(),
      brand: brand.trim(),
      line: line.trim() || brand.trim(),
      details: details.trim(),
      bg,
      fg,
      image_path: uploadedImagePath ?? existingPoster?.imagePath ?? null,
    };
    const result = editingId
      ? await supabase.from('portfolio_posters').update(poster).eq('id', editingId)
      : await supabase.from('portfolio_posters').insert(poster);
    if (result.error) {
      const { error: cleanupError } = uploadedImagePath
        ? await supabase.storage.from(MEDIA_BUCKET).remove([uploadedImagePath])
        : { error: null };
      setBusy(false);
      setError(`Could not ${editingId ? 'update' : 'add'} poster: ${result.error.message}. Confirm the poster table policies are installed.`);
      if (cleanupError) setError((message) => `${message} Uploaded image cleanup also failed: ${cleanupError.message}.`);
      return;
    }
    let oldImageCleanupError: string | null = null;
    if (uploadedImagePath && existingPoster?.imagePath) {
      const { error: removeError } = await supabase.storage.from(MEDIA_BUCKET).remove([existingPoster.imagePath]);
      oldImageCleanupError = removeError?.message ?? null;
    }
    setBusy(false);
    resetForm();
    setStatus(oldImageCleanupError
      ? `Poster saved, but the previous image could not be removed: ${oldImageCleanupError}`
      : editingId ? 'Poster updated.' : 'Poster added.');
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
    if (deleteError) {
      setBusy(false);
      setError(`Could not delete poster: ${deleteError.message}`);
      return;
    }
    let imageDeleteError: string | null = null;
    if (poster.imagePath) {
      const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([poster.imagePath]);
      imageDeleteError = error?.message ?? null;
    }
    if (selected?.id === poster.id) setSelected(null);
    setBusy(false);
    setStatus(imageDeleteError
      ? `Poster deleted, but its image could not be removed from Storage: ${imageDeleteError}`
      : 'Poster deleted.');
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
                <label className="space-y-1 text-xs text-mu sm:col-span-2">Poster image
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={choosePosterImage} className="block w-full text-sm text-mu file:mr-3 file:rounded-lg file:border-0 file:bg-bg file:px-3 file:py-2 file:text-xs file:text-ac" />
                  <span className="block text-xs text-mu">{imageFile ? `Selected: ${imageFile.name}` : editingId ? 'Choose an image to replace the current one. Leave empty to keep it.' : 'Choose a JPG, PNG, WebP, GIF, or AVIF image. Optional.'}</span>
                  {imagePreviewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreviewUrl} alt="Selected poster preview" className="mt-2 max-h-64 w-full rounded-xl bg-bg object-contain" />
                  )}
                </label>
                <label className="space-y-1 text-xs text-mu">Poster category
                  <input value={kind} onChange={(event) => setKind(event.target.value)} maxLength={60} required placeholder="Product launch" className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
                </label>
                <label className="space-y-1 text-xs text-mu">Brand / account
                  <input value={brand} onChange={(event) => setBrand(event.target.value)} maxLength={80} required placeholder="Brand name" className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
                </label>
                <label className="space-y-1 text-xs text-mu sm:col-span-2">Main poster text
                  <textarea value={line} onChange={(event) => setLine(event.target.value)} maxLength={180} rows={2} placeholder="Optional if you upload a poster image" className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
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
                <PosterArt poster={poster} minHeight={`${11 + (n % 3) * 4}rem`} imageUrl={poster.imageUrl} />
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
            <PosterArt poster={selected} minHeight="60vh" imageUrl={selected.imageUrl} large />
          </>
        )}
      </Modal>
    </>
  );
}
