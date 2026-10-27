'use client';
import { useRef, type ChangeEvent, type RefObject } from 'react';
import GalleryMediaCard from './GalleryMediaCard';
import type { GalleryBusy, GalleryEntry, MediaKind } from './galleryTypes';

interface GalleryRailProps {
  label: string;
  kind: MediaKind;
  entries: GalleryEntry[];
  railRef: RefObject<HTMLDivElement | null>;
  isAdmin: boolean;
  busy: GalleryBusy;
  editingPath: string | null;
  editTitle: string;
  editDescription: string;
  onSelectFile: (kind: MediaKind, file?: File) => void;
  onDelete: (media: GalleryEntry['item']) => void;
  onStartEditing: (media: GalleryEntry['item']) => void;
  onSaveDetails: (media: GalleryEntry['item']) => void;
  onEditTitleChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onCancelEditing: () => void;
}

export default function GalleryRail({
  label,
  kind,
  entries,
  railRef,
  isAdmin,
  busy,
  editingPath,
  editTitle,
  editDescription,
  onSelectFile,
  onDelete,
  onStartEditing,
  onSaveDetails,
  onEditTitleChange,
  onEditDescriptionChange,
  onCancelEditing,
}: GalleryRailProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onSelectFile(kind, event.currentTarget.files?.[0]);
    event.currentTarget.value = '';
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-heading about-section-heading gradient-text font-display">{label}</h2>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <>
              <input ref={fileInputRef} type="file" accept={kind === 'video' ? 'video/*' : 'image/*'} className="sr-only" onChange={handleFileChange} />
              <button type="button" className="ulink font-mono text-xs text-ac" disabled={busy !== null} onClick={() => fileInputRef.current?.click()}>
                {busy === kind ? 'Uploading…' : `Add ${kind === 'video' ? 'videos' : 'photos'}`}
              </button>
            </>
          )}
          <button type="button" className="ulink font-mono text-xs text-mu" aria-label={`Scroll ${label.toLowerCase()} left`} onClick={() => railRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}>←</button>
          <button type="button" className="ulink font-mono text-xs text-mu" aria-label={`Scroll ${label.toLowerCase()} right`} onClick={() => railRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}>→</button>
        </div>
      </div>
      {entries.length ? (
        <div ref={railRef} tabIndex={0} role="region" aria-label={`${label}, horizontal gallery`} className="ugc-rail">
          {entries.map((entry) => (
            <GalleryMediaCard
              key={entry.id}
              media={entry.item}
              kind={kind}
              isAdmin={isAdmin}
              busy={busy}
              editing={editingPath === entry.item.path}
              editTitle={editTitle}
              editDescription={editDescription}
              onDelete={onDelete}
              onStartEditing={onStartEditing}
              onSaveDetails={onSaveDetails}
              onEditTitleChange={onEditTitleChange}
              onEditDescriptionChange={onEditDescriptionChange}
              onCancelEditing={onCancelEditing}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-soft/70 p-5 text-sm text-mu">No {kind}s added yet.</p>
      )}
    </section>
  );
}
