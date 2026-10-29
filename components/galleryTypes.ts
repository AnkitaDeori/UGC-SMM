export type MediaKind = 'video' | 'photo';
export type GalleryBusy = MediaKind | 'login' | 'delete' | 'save' | null;

export interface UploadedMedia {
  kind: MediaKind;
  name: string;
  path: string;
  url: string;
  posterPath: string | null;
  posterUrl: string | null;
  createdAt: string;
  title: string;
  description: string;
}

export type GalleryEntry = { id: string; kind: 'uploaded'; item: UploadedMedia };
