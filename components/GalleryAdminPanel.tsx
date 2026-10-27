'use client';
import type { User } from '@supabase/supabase-js';
import type { GalleryBusy, MediaKind } from './galleryTypes';

interface GalleryAdminPanelProps {
  adminAccess: boolean;
  adminOpen: boolean;
  isAdmin: boolean;
  loaded: boolean;
  user: User | null;
  adminEmail: string;
  busy: GalleryBusy;
  selectedFile: File | null;
  selectedKind: MediaKind | null;
  draftTitle: string;
  draftDescription: string;
  error: string;
  status: string;
  onToggle: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onUpload: () => void;
  onCancelUpload: () => void;
  onDraftTitleChange: (value: string) => void;
  onDraftDescriptionChange: (value: string) => void;
}

export default function GalleryAdminPanel({
  adminAccess,
  adminOpen,
  isAdmin,
  loaded,
  user,
  adminEmail,
  busy,
  selectedFile,
  selectedKind,
  draftTitle,
  draftDescription,
  error,
  status,
  onToggle,
  onSignIn,
  onSignOut,
  onUpload,
  onCancelUpload,
  onDraftTitleChange,
  onDraftDescriptionChange,
}: GalleryAdminPanelProps) {
  const controls = isAdmin ? (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-xs text-mu">Admin: {user?.email}</span>
      <button type="button" className="ulink font-mono text-xs text-ac" onClick={onSignOut}>Sign out</button>
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
      <button type="button" className="cta text-sm" disabled={!loaded || busy !== null} onClick={onSignIn}>
        {busy === 'login' ? 'Sending link…' : 'Send admin sign-in link'}
      </button>
    </div>
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-xs text-mu">Selected concepts and uploaded portfolio work</p>
        {(adminAccess || isAdmin) && (
          <button type="button" className="ulink font-mono text-xs text-ac" aria-expanded={adminOpen} onClick={onToggle}>
            {adminOpen ? 'Close admin' : 'Admin tools'}
          </button>
        )}
      </div>
      {adminOpen && (adminAccess || isAdmin) && (
        <div className="max-w-xl space-y-4 rounded-2xl border border-ac/15 bg-soft/50 p-5">
          {controls}
          {isAdmin && selectedFile && selectedKind && (
            <form
              className="space-y-3 border-t border-ac/15 pt-4"
              onSubmit={(event) => {
                event.preventDefault();
                onUpload();
              }}
            >
              <p className="font-mono text-xs text-mu">Ready to upload: {selectedFile.name}</p>
              <label className="block space-y-1 text-xs text-mu">
                Title
                <input value={draftTitle} onChange={(event) => onDraftTitleChange(event.target.value)} maxLength={100} required className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
              </label>
              <label className="block space-y-1 text-xs text-mu">
                Details
                <textarea value={draftDescription} onChange={(event) => onDraftDescriptionChange(event.target.value)} maxLength={500} rows={3} placeholder={`Add details about this ${selectedKind}…`} className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
              </label>
              <div className="flex gap-4">
                <button type="submit" className="ulink font-mono text-xs text-ac" disabled={busy !== null}>{busy === selectedKind ? 'Uploading…' : `Upload ${selectedKind}`}</button>
                <button type="button" className="ulink font-mono text-xs text-mu" disabled={busy !== null} onClick={onCancelUpload}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
      {error && <p role="alert" className="rounded-xl bg-soft p-4 text-sm text-ac">{error}</p>}
      {status && <p role="status" className="text-sm text-mu">{status}</p>}
    </>
  );
}
