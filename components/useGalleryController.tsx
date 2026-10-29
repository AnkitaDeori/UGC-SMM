'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, MEDIA_BUCKET } from '@/lib/supabase';
import type { GalleryEntry, GalleryBusy, MediaKind, UploadedMedia } from './galleryTypes';

const adminEmail = process.env.NEXT_PUBLIC_SUPABASE_ADMIN_EMAIL?.trim().toLowerCase() ?? '';
const supportedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
]);
const imageTypeAliases: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'image/heic-sequence': 'image/heic',
  'image/heif-sequence': 'image/heif',
  'image/x-heic': 'image/heic',
  'image/x-heif': 'image/heif',
};
const imageExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

function imageContentType(file: File) {
  const reportedType = file.type.toLowerCase().split(';')[0];
  const normalizedType = imageTypeAliases[reportedType] ?? reportedType;
  if (supportedImageTypes.has(normalizedType)) return normalizedType;
  const extension = file.name.split('.').pop()?.toLowerCase();
  const fallbackTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    avif: 'image/avif',
    heic: 'image/heic',
    heif: 'image/heif',
  };
  return extension ? fallbackTypes[extension] ?? '' : '';
}

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

function isGalleryFile(name: string, kind: MediaKind) {
  const extensions = kind === 'video'
    ? /\.(mp4|m4v|mov|webm|ogv)$/i
    : /\.(jpe?g|png|webp|gif|avif|heic|heif)$/i;
  return extensions.test(name);
}

function photoUploadName(filename: string, contentType: string) {
  const extension = imageExtensions[contentType];
  const baseName = filename.replace(/\.[^.]+$/, '');
  const safeBaseName = baseName.replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '').slice(-110);
  return `${safeBaseName || 'photo'}.${extension}`;
}

async function createVideoPoster(file: File, frameTime: number): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';

  try {
    return await new Promise<Blob>((resolve, reject) => {
      let settled = false;
      const timeout = window.setTimeout(() => finish(undefined, new Error('Timed out while reading the video.')), 15000);

      const finish = (blob?: Blob, error?: Error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        video.onloadedmetadata = null;
        video.onloadeddata = null;
        video.onseeked = null;
        video.onerror = null;
        if (error) reject(error);
        else if (blob) resolve(blob);
        else reject(new Error('Could not create an image from this video.'));
      };

      const captureFrame = () => {
        if (!video.videoWidth || !video.videoHeight) {
          finish(undefined, new Error('The video has no readable frame.'));
          return;
        }

        const scale = Math.min(1, 480 / video.videoWidth);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        const context = canvas.getContext('2d');
        if (!context) {
          finish(undefined, new Error('This browser could not prepare the cover image.'));
          return;
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => finish(blob ?? undefined, blob ? undefined : new Error('This browser could not encode the cover image.')),
          'image/jpeg',
          0.78,
        );
      };

      video.onerror = () => finish(undefined, new Error('This browser cannot read this video format for a cover image.'));
      video.onloadedmetadata = () => {
        if (Number.isFinite(video.duration) && video.duration > 0) {
          video.currentTime = Math.min(Math.max(frameTime, 0), Math.max(0, video.duration - 0.05));
        }
      };
      video.onseeked = captureFrame;
      video.onloadeddata = () => {
        if (!Number.isFinite(video.duration) || video.duration === 0 || frameTime === 0) captureFrame();
      };
      video.src = objectUrl;
      video.load();
    });
  } finally {
    video.pause();
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

export default function useGalleryController() {
  const videosRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [uploaded, setUploaded] = useState<UploadedMedia[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<GalleryBusy>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedKind, setSelectedKind] = useState<MediaKind | null>(null);
  const [selectedPosterTime, setSelectedPosterTime] = useState<number | null>(null);
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

    const [videos, photos] = await Promise.all([
      supabase.storage.from(MEDIA_BUCKET).list('videos', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } }),
      supabase.storage.from(MEDIA_BUCKET).list('photos', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } }),
    ]);
    const failure = videos.error ?? photos.error;
    if (failure) {
      setError(`Could not load gallery media: ${failure.message}`);
      return;
    }

    let detailsResult = await supabase.from('portfolio_media').select('object_path, title, description, poster_path');
    let posterColumnAvailable = !detailsResult.error;
    if (detailsResult.error?.message.includes('poster_path')) {
      detailsResult = await supabase.from('portfolio_media').select('object_path, title, description');
      posterColumnAvailable = false;
    }

    const savedDetails = new Map(
      (detailsResult.data ?? []).map((row) => [row.object_path as string, row])
    );
    if (detailsResult.error) {
      setError(`Could not load saved media details: ${detailsResult.error.message}. Run the latest supabase/setup.sql to create/update the portfolio_media table.`);
    } else if (!posterColumnAvailable) {
      setError('Photos can still be uploaded, but run the latest supabase/setup.sql to enable saved video cover images.');
    }

    const assets: UploadedMedia[] = [
      ...(videos.data ?? []).filter((file) => isGalleryFile(file.name, 'video')).map((file) => ({
        kind: 'video' as const,
        name: file.name,
        path: `videos/${file.name}`,
        url: supabase.storage.from(MEDIA_BUCKET).getPublicUrl(`videos/${file.name}`).data.publicUrl,
        createdAt: file.created_at ?? '',
        ...(() => {
          const saved = savedDetails.get(`videos/${file.name}`);
          const posterPath = typeof saved?.poster_path === 'string'
            ? saved.poster_path
            : typeof file.metadata?.poster_path === 'string'
              ? file.metadata.poster_path
              : null;
          return saved
            ? {
                title: saved.title,
                description: saved.description,
                posterPath,
                posterUrl: posterPath ? supabase.storage.from(MEDIA_BUCKET).getPublicUrl(posterPath).data.publicUrl : null,
              }
            : {
                ...mediaDetails(file.metadata, file.name),
                posterPath,
                posterUrl: posterPath ? supabase.storage.from(MEDIA_BUCKET).getPublicUrl(posterPath).data.publicUrl : null,
              };
        })(),
      })),
      ...(photos.data ?? []).filter((file) => isGalleryFile(file.name, 'photo')).map((file) => ({
        kind: 'photo' as const,
        name: file.name,
        path: `photos/${file.name}`,
        url: supabase.storage.from(MEDIA_BUCKET).getPublicUrl(`photos/${file.name}`).data.publicUrl,
        createdAt: file.created_at ?? '',
        posterPath: null,
        posterUrl: null,
        ...(() => {
          const saved = savedDetails.get(`photos/${file.name}`);
          return saved
            ? { title: saved.title, description: saved.description }
            : mediaDetails(file.metadata, file.name);
        })(),
      })),
    ];
    setUploaded(assets);
    if (!detailsResult.error && posterColumnAvailable) setError('');
  }, []);

  useEffect(() => {
    const hasAdminAccess = new URLSearchParams(window.location.search).get('admin') === '1';
    setAdminAccess(hasAdminAccess);
    setAdminOpen(hasAdminAccess);
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
      setLoaded(true);
    });
    void refreshMedia();

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
      options: { emailRedirectTo: `${window.location.origin}/ugc?admin=1` },
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
    const validType = kind === 'video' ? file.type.startsWith('video/') : !!imageContentType(file);
    if (!validType) {
      setError(kind === 'video'
        ? 'Choose a valid video file.'
        : 'Choose a JPG, PNG, WebP, GIF, AVIF, HEIC, or HEIF image.');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('Files must be 100 MB or smaller.');
      return;
    }
    setSelectedFile(file);
    setSelectedKind(kind);
    setSelectedPosterTime(null);
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
    if (kind === 'video' && selectedPosterTime === null) {
      setError('Choose a frame from the video to use as its cover image.');
      return;
    }
    if (!draftTitle.trim()) {
      setError('Add a title before uploading.');
      return;
    }
    if (!supabase || !isAdmin) {
      setError('Sign in with the configured admin account before uploading.');
      return;
    }
    const photoType = kind === 'photo' ? imageContentType(file) : '';
    if (kind === 'photo' && !photoType) {
      setError(`Could not identify the image format for "${file.name}". Choose a JPG, PNG, WebP, GIF, AVIF, HEIC, or HEIF photo.`);
      return;
    }

    setBusy(kind);
    setError('');
    setStatus('');
    let posterBlob: Blob | null = null;
    if (kind === 'video') {
      try {
        posterBlob = await createVideoPoster(file, selectedPosterTime ?? 0);
      } catch (posterError) {
        setBusy(null);
        const reason = posterError instanceof Error ? ` ${posterError.message}` : '';
        setError(`Could not create a cover image for this video.${reason} Try an MP4 video that plays on this device.`);
        return;
      }
    }

    const safeName = kind === 'photo'
      ? photoUploadName(file.name, photoType)
      : file.name.replace(/[^\w.-]+/g, '-').slice(-120) || `upload-${Date.now()}`;
    const mediaId = crypto.randomUUID();
    const path = `${kind === 'video' ? 'videos' : 'photos'}/${mediaId}-${safeName}`;
    const posterPath = posterBlob ? `posters/${mediaId}.jpg` : null;
    if (posterBlob && posterPath) {
      const { error: posterUploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(posterPath, posterBlob, {
        contentType: 'image/jpeg',
        upsert: false,
      });
      if (posterUploadError) {
        setBusy(null);
        setError(`Could not upload the video cover image: ${posterUploadError.message}. Check that the Storage policies in supabase/setup.sql are installed for the configured admin email.`);
        return;
      }
    }

    let uploadError: Error | null = null;
    try {
      ({ error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
        contentType: kind === 'photo' ? photoType : file.type,
        metadata: {
          title: draftTitle.trim(),
          description: draftDescription.trim(),
          ...(posterPath ? { poster_path: posterPath } : {}),
        },
        upsert: false,
      }));
    } catch (reason) {
      uploadError = reason instanceof Error ? reason : new Error(String(reason));
    }
    if (uploadError) {
      const { error: cleanupError } = posterPath
        ? await supabase.storage.from(MEDIA_BUCKET).remove([posterPath])
        : { error: null };
      setBusy(null);
      const fileInfo = kind === 'photo'
        ? ` File: ${file.name} (${photoType}, ${(file.size / (1024 * 1024)).toFixed(1)} MB).`
        : '';
      setError(`${kind === 'photo' ? 'Photo' : 'Video'} upload failed: ${uploadError.message}.${fileInfo}${cleanupError ? ` Cover cleanup also failed: ${cleanupError.message}.` : ''} Verify the bucket MIME types and admin Storage policy in supabase/setup.sql, run that SQL in the correct Supabase project, and sign in again with the configured admin email.`);
      return;
    }
    const uploadedPath = path;
    const newMedia: UploadedMedia = {
      kind,
      name: path.slice(path.indexOf('/') + 1),
      path: uploadedPath,
      url: supabase.storage.from(MEDIA_BUCKET).getPublicUrl(uploadedPath).data.publicUrl,
      posterPath,
      posterUrl: posterPath ? supabase.storage.from(MEDIA_BUCKET).getPublicUrl(posterPath).data.publicUrl : null,
      createdAt: new Date().toISOString(),
      title: draftTitle.trim(),
      description: draftDescription.trim(),
    };
    const { error: detailsError } = await supabase.from('portfolio_media').upsert({
      kind,
      object_path: uploadedPath,
      title: newMedia.title,
      description: newMedia.description,
      ...(posterPath ? { poster_path: posterPath } : {}),
      created_by: user?.id ?? null,
    }, { onConflict: 'object_path' });
    if (detailsError) {
      setUploaded((current) => [newMedia, ...current.filter((media) => media.path !== uploadedPath)]);
      setBusy(null);
      setSelectedFile(null);
      setSelectedKind(null);
      setSelectedPosterTime(null);
      setDraftTitle('');
      setDraftDescription('');
      await refreshMedia();
      setError(`${kind === 'video' ? 'Video' : 'Photo'} file uploaded, but its saved details could not be saved: ${detailsError.message}. The file remains in Storage and the gallery; run the latest supabase/setup.sql and check the admin table policy to save details.`);
      return;
    }
    setUploaded((current) => [newMedia, ...current.filter((media) => media.path !== uploadedPath)]);
    setBusy(null);
    setStatus(`${kind === 'video' ? 'Video' : 'Photo'} uploaded.`);
    setSelectedFile(null);
    setSelectedKind(null);
    setSelectedPosterTime(null);
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
    const pathsToDelete = [media.path, ...(media.posterPath ? [media.posterPath] : [])];
    const { error: deleteError } = await supabase.storage.from(MEDIA_BUCKET).remove(pathsToDelete);
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

  return {
    videosRef,
    photosRef,
    user,
    adminOpen,
    adminAccess,
    loaded,
    busy,
    selectedFile,
    selectedKind,
    selectedPosterTime,
    draftTitle,
    draftDescription,
    editingPath,
    editTitle,
    editDescription,
    status,
    error,
    adminEmail,
    isAdmin,
    videos,
    photos,
    toggleAdmin: () => setAdminOpen(!adminOpen),
    signIn,
    signOut,
    uploadFile,
    cancelUpload: () => {
      setSelectedFile(null);
      setSelectedKind(null);
      setSelectedPosterTime(null);
    },
    selectPosterTime: setSelectedPosterTime,
    setDraftTitle,
    setDraftDescription,
    selectFile,
    deleteMedia,
    startEditing,
    saveDetails,
    setEditTitle,
    setEditDescription,
    cancelEditing: () => setEditingPath(null),
  };
}