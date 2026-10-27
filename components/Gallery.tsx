'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, MEDIA_BUCKET } from '@/lib/supabase';

type MediaKind = 'video' | 'photo';
interface UploadedMedia {
  kind: MediaKind;
  name: string;
  path: string;
  url: string;
  createdAt: string;
  title: string;
  description: string;
}
type GalleryEntry = { id: string; kind: 'uploaded'; item: UploadedMedia };

const adminEmail = process.env.NEXT_PUBLIC_SUPABASE_ADMIN_EMAIL?.trim().toLowerCase() ?? '';

function titleFor(filename: string) {
  return filename
    .replace(/^[\da-f-]{36}-/i, '')
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

function mediaDetails(metadata: Record<string, unknown> | null | undefined, filename: string) {
  const title = typeof metadata?.title === 'string' ? metadata.title.trim() : '';
  const description = typeof metadata?.description === 'string' ? metadata.description.trim() : '';
  return { title: title || titleFor(filename), description };
}

export default function Gallery() {
  const videosRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [uploaded, setUploaded] = useState<UploadedMedia[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<MediaKind | 'login' | 'delete' | 'save' | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedKind, setSelectedKind] = useState<MediaKind | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const refreshMedia = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const [videos, photos, detailsResult] = await Promise.all([
      supabase.storage.from(MEDIA_BUCKET).list('videos', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } }),
      supabase.storage.from(MEDIA_BUCKET).list('photos', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } }),
      supabase.from('portfolio_media').select('object_path, title, description'),
    ]);
    const failure = videos.error ?? photos.error;
    if (failure) {
      setError(`Could not load gallery media: ${failure.message}`);
      return;
    }

    const savedDetails = new Map(
      (detailsResult.data ?? []).map((row) => [row.object_path as string, row])
    );
    if (detailsResult.error) {
      setError(`Could not load saved media details: ${detailsResult.error.message}. Run the latest supabase/setup.sql to create the portfolio_media table.`);
    }

    const assets: UploadedMedia[] = [
      ...(videos.data ?? []).filter((file) => file.id || file.created_at || file.metadata).map((file) => ({
        kind: 'video' as const,
        name: file.name,
        path: `videos/${file.name}`,
        url: supabase.storage.from(MEDIA_BUCKET).getPublicUrl(`videos/${file.name}`).data.publicUrl,
        createdAt: file.created_at ?? '',
        ...(() => {
          const saved = savedDetails.get(`videos/${file.name}`);
          return saved
            ? { title: saved.title, description: saved.description }
            : mediaDetails(file.metadata, file.name);
        })(),
      })),
      ...(photos.data ?? []).filter((file) => file.id || file.created_at || file.metadata).map((file) => ({
        kind: 'photo' as const,
        name: file.name,
        path: `photos/${file.name}`,
        url: supabase.storage.from(MEDIA_BUCKET).getPublicUrl(`photos/${file.name}`).data.publicUrl,
        createdAt: file.created_at ?? '',
        ...(() => {
          const saved = savedDetails.get(`photos/${file.name}`);
          return saved
            ? { title: saved.title, description: saved.description }
            : mediaDetails(file.metadata, file.name);
        })(),
      })),
    ];
    setUploaded(assets);
    if (!detailsResult.error) setError('');
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoaded(true);
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(`Could not check admin sign-in: ${sessionError.message}`);
      setUser(data.session?.user ?? null);
      setLoaded(true);
    });
    void refreshMedia();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshMedia]);

  const isAdmin = !!adminEmail && user?.email?.trim().toLowerCase() === adminEmail;
  const videos: GalleryEntry[] = uploaded.filter((media) => media.kind === 'video').map((item) => ({ id: item.path, kind: 'uploaded', item }));
  const photos: GalleryEntry[] = uploaded.filter((media) => media.kind === 'photo').map((item) => ({ id: item.path, kind: 'uploaded', item }));

  async function signIn() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !adminEmail) {
      setError('Set the Supabase URL, anon key, and admin email in .env.local before signing in.');
      return;
    }
    setBusy('login');
    setError('');
    setStatus('');
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: adminEmail,
      options: { emailRedirectTo: `${window.location.origin}/ugc` },
    });
    setBusy(null);
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

  function selectFile(kind: MediaKind, file?: File) {
    if (!file) return;
    const validType = kind === 'video' ? file.type.startsWith('video/') : file.type.startsWith('image/');
    if (!validType) {
      setError(`Choose a valid ${kind} file.`);
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('Files must be 100 MB or smaller.');
      return;
    }
    setSelectedFile(file);
    setSelectedKind(kind);
    setDraftTitle(titleFor(file.name));
    setDraftDescription('');
    setAdminOpen(true);
    setError('');
    setStatus('');
  }

  async function uploadFile() {
    const file = selectedFile;
    const kind = selectedKind;
    if (!file || !kind) return;
    const supabase = getSupabaseBrowserClient();
    if (!draftTitle.trim()) {
      setError('Add a title before uploading.');
      return;
    }
    if (!supabase || !isAdmin) {
      setError('Sign in with the configured admin account before uploading.');
      return;
    }

    setBusy(kind);
    setError('');
    setStatus('');
    const safeName = file.name.replace(/[^\w.-]+/g, '-').slice(-120) || `upload-${Date.now()}`;
    const path = `${kind === 'video' ? 'videos' : 'photos'}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
      contentType: file.type,
      metadata: { title: draftTitle.trim(), description: draftDescription.trim() },
      upsert: false,
    });
    if (uploadError) {
      setBusy(null);
      setError(`Upload failed: ${uploadError.message}. Check that the Storage policies in supabase/setup.sql are installed for the same admin email shown in .env.local, then sign out and sign in again.`);
      return;
    }
    const uploadedPath = path;
    const newMedia: UploadedMedia = {
      kind,
      name: path.slice(path.indexOf('/') + 1),
      path: uploadedPath,
      url: supabase.storage.from(MEDIA_BUCKET).getPublicUrl(uploadedPath).data.publicUrl,
      createdAt: new Date().toISOString(),
      title: draftTitle.trim(),
      description: draftDescription.trim(),
    };
    const { error: detailsError } = await supabase.from('portfolio_media').upsert({
      kind,
      object_path: uploadedPath,
      title: newMedia.title,
      description: newMedia.description,
      created_by: user?.id ?? null,
    }, { onConflict: 'object_path' });
    if (detailsError) {
      const { error: cleanupError } = await supabase.storage.from(MEDIA_BUCKET).remove([uploadedPath]);
      setBusy(null);
      setError(`The file uploaded but its details could not be saved: ${detailsError.message}.${cleanupError ? ` Cleanup also failed: ${cleanupError.message}.` : ' The incomplete upload was removed.'} Run the latest supabase/setup.sql and retry.`);
      return;
    }
    setUploaded((current) => [newMedia, ...current.filter((media) => media.path !== uploadedPath)]);
    setBusy(null);
    setStatus(`${kind === 'video' ? 'Video' : 'Photo'} uploaded.`);
    setSelectedFile(null);
    setSelectedKind(null);
    setDraftTitle('');
    setDraftDescription('');
    await refreshMedia();
  }

  async function saveDetails(media: UploadedMedia) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !isAdmin) {
      setError('Sign in with the configured admin account before editing media details.');
      return;
    }
    if (!editTitle.trim()) {
      setError('Add a title before saving.');
      return;
    }

    setBusy('save');
    setError('');
    setStatus('');
    const updatedTitle = editTitle.trim();
    const updatedDescription = editDescription.trim();
    const { error: updateError } = await supabase.from('portfolio_media').upsert({
      kind: media.kind,
      object_path: media.path,
      title: updatedTitle,
      description: updatedDescription,
      created_by: user?.id ?? null,
    }, { onConflict: 'object_path' });
    setBusy(null);
    if (updateError) {
      setError(`Could not save details: ${updateError.message}. Run the latest supabase/setup.sql and confirm the admin has insert/update access to portfolio_media.`);
      return;
    }
    setUploaded((current) => current.map((item) => item.path === media.path
      ? { ...item, title: updatedTitle, description: updatedDescription }
      : item));
    setEditingPath(null);
    setStatus('Media details saved.');
    await refreshMedia();
  }

  async function deleteMedia(media: UploadedMedia) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !isAdmin) {
      setError('Sign in with the configured admin account before deleting media.');
      return;
    }
    if (!window.confirm(`Delete “${media.title}” permanently?`)) return;

    setBusy('delete');
    setError('');
    setStatus('');
    const { error: deleteError } = await supabase.storage.from(MEDIA_BUCKET).remove([media.path]);
    if (deleteError) {
      setBusy(null);
      setError(`Could not delete media: ${deleteError.message}. Check the admin delete policy in supabase/setup.sql.`);
      return;
    }
    const { error: detailsDeleteError } = await supabase.from('portfolio_media').delete().eq('object_path', media.path);
    if (detailsDeleteError) {
      setBusy(null);
      setError(`The media file was deleted, but its saved details could not be removed: ${detailsDeleteError.message}.`);
      return;
    }
    if (editingPath === media.path) setEditingPath(null);
    setUploaded((current) => current.filter((item) => item.path !== media.path));
    setBusy(null);
    setStatus(`${media.kind === 'video' ? 'Video' : 'Photo'} deleted.`);
    await refreshMedia();
  }

  function startEditing(media: UploadedMedia) {
    setEditingPath(media.path);
    setEditTitle(media.title);
    setEditDescription(media.description);
    setError('');
    setStatus('');
  }

  function renderRail(label: string, kind: MediaKind, entries: GalleryEntry[], ref: RefObject<HTMLDivElement | null>) {
    const isUploading = busy === kind;
    const inputRef = kind === 'video' ? videoInput : photoInput;
    return (
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-ac md:text-3xl">{label}</h2>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <>
                <input
                  ref={inputRef}
                  type="file"
                  accept={kind === 'video' ? 'video/*' : 'image/*'}
                  className="sr-only"
                  onChange={(event) => {
                    selectFile(kind, event.currentTarget.files?.[0]);
                    event.currentTarget.value = '';
                  }}
                />
                <button type="button" className="ulink font-mono text-xs text-ac" disabled={busy !== null} onClick={() => inputRef.current?.click()}>
                  {isUploading ? 'Uploading…' : `Add ${kind === 'video' ? 'videos' : 'photos'}`}
                </button>
              </>
            )}
            <button type="button" className="ulink font-mono text-xs text-mu" aria-label={`Scroll ${label.toLowerCase()} left`} onClick={() => ref.current?.scrollBy({ left: -320, behavior: 'smooth' })}>←</button>
            <button type="button" className="ulink font-mono text-xs text-mu" aria-label={`Scroll ${label.toLowerCase()} right`} onClick={() => ref.current?.scrollBy({ left: 320, behavior: 'smooth' })}>→</button>
          </div>
        </div>

        {entries.length ? (
          <div ref={ref} tabIndex={0} role="region" aria-label={`${label}, horizontal gallery`} className="ugc-rail">
            {entries.map((entry) => (
              <article key={entry.id} className="ugc-card relative">
                <div className="ugc-card-frame grid place-items-center">
                  {entry.item.kind === 'video'
                    ? <video src={entry.item.url} controls playsInline preload="metadata" aria-label={entry.item.title} className="h-full w-full object-cover" />
                    : /* eslint-disable-next-line @next/next/no-img-element */ <img src={entry.item.url} alt={entry.item.title} className="h-full w-full object-cover" />
                  }
                </div>
                {isAdmin && (
                  <div className="absolute right-2 top-2 z-10 flex gap-2 rounded-full bg-bg/95 p-1 shadow">
                    <button type="button" className="rounded-full bg-red-700 px-3 py-2 font-mono text-xs font-bold text-white hover:bg-red-800" disabled={busy !== null} onClick={() => void deleteMedia(entry.item)}>
                      {busy === 'delete' ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                )}
                <h3 className="mt-3 font-display text-lg text-ac">
                  {entry.item.title}
                </h3>
                <p className="font-mono text-xs text-mu">
                  {`Portfolio ${kind}`}
                </p>
                <p className="mt-1 text-sm text-mu">
                  {entry.item.description || `Add a description for this ${kind} from the Admin panel.`}
                </p>
                {isAdmin && (
                  <div className="mt-3 flex flex-wrap gap-4">
                    <button type="button" className="ulink font-mono text-xs text-ac" disabled={busy !== null} onClick={() => startEditing(entry.item)}>Edit details</button>
                  </div>
                )}
                {isAdmin && editingPath === entry.item.path && (
                  <form
                    className="mt-3 w-full space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void saveDetails(entry.item);
                    }}
                  >
                    <label className="block space-y-1 text-xs text-mu">
                      Title
                      <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} maxLength={100} required className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
                    </label>
                    <label className="block space-y-1 text-xs text-mu">
                      Details
                      <textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} maxLength={500} rows={3} placeholder={`Add details about this ${kind}…`} className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
                    </label>
                    <div className="flex gap-4">
                      <button type="submit" className="ulink font-mono text-xs text-ac" disabled={busy !== null}>{busy === 'save' ? 'Saving…' : 'Save details'}</button>
                      <button type="button" className="ulink font-mono text-xs text-mu" onClick={() => setEditingPath(null)}>Cancel</button>
                    </div>
                  </form>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-soft/70 p-5 text-sm text-mu">No {kind}s added yet.</p>
        )}
      </section>
    );
  }

  const controls: ReactNode = isAdmin ? (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-xs text-mu">Admin: {user?.email}</span>
      <button type="button" className="ulink font-mono text-xs text-ac" onClick={() => void signOut()}>Sign out</button>
    </div>
  ) : user ? (
    <p className="text-sm text-mu">Signed in as {user.email}; this account is not the configured admin.</p>
  ) : (
    <div className="space-y-3">
      <p className="text-sm text-mu">
        {adminEmail
          ? `A secure sign-in link will be sent to ${adminEmail}.`
          : 'Connect Supabase and configure the admin email to enable protected uploads.'}
      </p>
      <button type="button" className="cta text-sm" disabled={!loaded || busy !== null} onClick={() => void signIn()}>
        {busy === 'login' ? 'Sending link…' : 'Send admin sign-in link'}
      </button>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-xs text-mu">Selected concepts and uploaded portfolio work</p>
        <button type="button" className="ulink font-mono text-xs text-ac" aria-expanded={adminOpen} onClick={() => setAdminOpen(!adminOpen)}>
          {adminOpen ? 'Close admin' : 'Admin'}
        </button>
      </div>

      {adminOpen && (
        <div className="max-w-xl space-y-4 rounded-2xl border border-ac/15 bg-soft/50 p-5">
          {controls}
          {isAdmin && selectedFile && selectedKind && (
            <form
              className="space-y-3 border-t border-ac/15 pt-4"
              onSubmit={(event) => {
                event.preventDefault();
                void uploadFile();
              }}
            >
              <p className="font-mono text-xs text-mu">Ready to upload: {selectedFile.name}</p>
              <label className="block space-y-1 text-xs text-mu">
                Title
                <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} maxLength={100} required className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
              </label>
              <label className="block space-y-1 text-xs text-mu">
                Details
                <textarea value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} maxLength={500} rows={3} placeholder={`Add details about this ${selectedKind}…`} className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
              </label>
              <div className="flex gap-4">
                <button type="submit" className="ulink font-mono text-xs text-ac" disabled={busy !== null}>{busy === selectedKind ? 'Uploading…' : `Upload ${selectedKind}`}</button>
                <button type="button" className="ulink font-mono text-xs text-mu" disabled={busy !== null} onClick={() => { setSelectedFile(null); setSelectedKind(null); }}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
      {error && <p role="alert" className="rounded-xl bg-soft p-4 text-sm text-ac">{error}</p>}
      {status && <p role="status" className="text-sm text-mu">{status}</p>}

      {renderRail('Videos', 'video', videos, videosRef)}
      {renderRail('Photos', 'photo', photos, photosRef)}
    </div>
  );
}
