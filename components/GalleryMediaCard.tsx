'use client';
import { useState } from 'react';
import type { GalleryBusy, MediaKind, UploadedMedia } from './galleryTypes';
import Modal from './Modal';

interface GalleryMediaCardProps {
  media: UploadedMedia;
  kind: MediaKind;
  isAdmin: boolean;
  busy: GalleryBusy;
  editing: boolean;
  editTitle: string;
  editDescription: string;
  onDelete: (media: UploadedMedia) => void;
  onStartEditing: (media: UploadedMedia) => void;
  onSaveDetails: (media: UploadedMedia) => void;
  onEditTitleChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onCancelEditing: () => void;
}

export default function GalleryMediaCard({
  media,
  kind,
  isAdmin,
  busy,
  editing,
  editTitle,
  editDescription,
  onDelete,
  onStartEditing,
  onSaveDetails,
  onEditTitleChange,
  onEditDescriptionChange,
  onCancelEditing,
}: GalleryMediaCardProps) {
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false);

  return (
    <article className="ugc-card relative">
      <div className={`ugc-card-frame grid place-items-center${media.kind === 'video' ? ' ugc-card-frame-video' : ''}`}>
        {media.kind === 'video'
          ? <video src={media.url} poster={media.posterUrl ?? undefined} controls playsInline preload={media.posterUrl ? 'none' : 'metadata'} aria-label={media.title} className="h-full w-full object-contain" />
          : (
            <button
              type="button"
              onClick={() => setPhotoPreviewOpen(true)}
              aria-label={`Enlarge photo: ${media.title}`}
              className="h-full w-full cursor-zoom-in"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media.url} alt={media.title} className="h-full w-full object-cover" />
            </button>
          )
        }
      </div>
      {media.kind === 'photo' && (
        <Modal open={photoPreviewOpen} onClose={() => setPhotoPreviewOpen(false)} label={`Photo preview: ${media.title}`}>
          <div className="clear-both">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.url} alt={media.title} className="mx-auto max-h-[75vh] w-full rounded-xl object-contain" />
            <h2 className="mt-4 font-display text-xl text-ac">{media.title}</h2>
            {media.description && <p className="mt-2 text-sm text-mu">{media.description}</p>}
          </div>
        </Modal>
      )}
      {isAdmin && (
        <div className="absolute right-2 top-2 z-10 flex gap-2 rounded-full bg-bg/95 p-1 shadow">
          <button type="button" className="rounded-full bg-red-700 px-3 py-2 font-mono text-xs font-bold text-white hover:bg-red-800" disabled={busy !== null} onClick={() => onDelete(media)}>
            {busy === 'delete' ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}
      <h3 className="mt-3 font-display text-lg text-ac">{media.title}</h3>
      <p className="font-mono text-xs text-mu">{`Portfolio ${kind}`}</p>
      <p className="mt-1 text-sm text-mu">{media.description || `Add a description for this ${kind} from the Admin panel.`}</p>
      {isAdmin && (
        <div className="mt-3 flex flex-wrap gap-4">
          <button type="button" className="ulink font-mono text-xs text-ac" disabled={busy !== null} onClick={() => onStartEditing(media)}>Edit details</button>
        </div>
      )}
      {isAdmin && editing && (
        <form
          className="mt-3 w-full space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSaveDetails(media);
          }}
        >
          <label className="block space-y-1 text-xs text-mu">
            Title
            <input value={editTitle} onChange={(event) => onEditTitleChange(event.target.value)} maxLength={100} required className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
          </label>
          <label className="block space-y-1 text-xs text-mu">
            Details
            <textarea value={editDescription} onChange={(event) => onEditDescriptionChange(event.target.value)} maxLength={500} rows={3} placeholder={`Add details about this ${kind}…`} className="w-full rounded-lg border border-ac/20 bg-bg px-3 py-2 text-sm text-tx" />
          </label>
          <div className="flex gap-4">
            <button type="submit" className="ulink font-mono text-xs text-ac" disabled={busy !== null}>{busy === 'save' ? 'Saving…' : 'Save details'}</button>
            <button type="button" className="ulink font-mono text-xs text-mu" onClick={onCancelEditing}>Cancel</button>
          </div>
        </form>
      )}
    </article>
  );
}
