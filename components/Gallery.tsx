'use client';
import GalleryAdminPanel from './GalleryAdminPanel';
import GalleryRail from './GalleryRail';
import useGalleryController from './useGalleryController';

export default function Gallery() {
  const gallery = useGalleryController();
  const railProps = {
    isAdmin: gallery.isAdmin,
    busy: gallery.busy,
    editingPath: gallery.editingPath,
    editTitle: gallery.editTitle,
    editDescription: gallery.editDescription,
    onSelectFile: gallery.selectFile,
    onDelete: (media: typeof gallery.videos[number]['item']) => void gallery.deleteMedia(media),
    onStartEditing: gallery.startEditing,
    onSaveDetails: (media: typeof gallery.videos[number]['item']) => void gallery.saveDetails(media),
    onEditTitleChange: gallery.setEditTitle,
    onEditDescriptionChange: gallery.setEditDescription,
    onCancelEditing: gallery.cancelEditing,
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-5">
      <GalleryAdminPanel
        adminAccess={gallery.adminAccess}
        adminOpen={gallery.adminOpen}
        isAdmin={gallery.isAdmin}
        loaded={gallery.loaded}
        user={gallery.user}
        adminEmail={gallery.adminEmail}
        busy={gallery.busy}
        selectedFile={gallery.selectedFile}
        selectedKind={gallery.selectedKind}
        draftTitle={gallery.draftTitle}
        draftDescription={gallery.draftDescription}
        error={gallery.error}
        status={gallery.status}
        onToggle={gallery.toggleAdmin}
        onSignIn={() => void gallery.signIn()}
        onSignOut={() => void gallery.signOut()}
        onUpload={() => void gallery.uploadFile()}
        onCancelUpload={gallery.cancelUpload}
        onDraftTitleChange={gallery.setDraftTitle}
        onDraftDescriptionChange={gallery.setDraftDescription}
      />
      <GalleryRail label="Videos" kind="video" entries={gallery.videos} railRef={gallery.videosRef} {...railProps} />
      <GalleryRail label="Photos" kind="photo" entries={gallery.photos} railRef={gallery.photosRef} {...railProps} />
    </div>
  );
}