'use client';
import { useEffect, useRef, type ReactNode } from 'react';

export default function Modal({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="m-auto w-[min(42rem,92vw)] rounded-3xl bg-bg p-8 text-tx shadow-2xl backdrop:bg-black/60"
    >
      <button type="button" onClick={onClose} className="ulink float-right font-mono text-xs text-mu">Close ✕</button>
      {children}
    </dialog>
  );
}
