import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export default function Dialog({ open, onClose, title, children, className = '' }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const dialog = ref.current!;
    if (!open) { if (dialog.open) dialog.close(); return; }
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    const cancel = (event: Event) => { event.preventDefault(); closeRef.current(); };
    dialog.addEventListener('cancel', cancel);
    return () => {
      if (dialog.open) dialog.close();
      dialog.removeEventListener('cancel', cancel);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);
  return <dialog ref={ref} className={`dialog ${className}`} aria-label={title} data-lenis-prevent onClick={event => {
    if (event.target === ref.current) {
      const bounds = ref.current.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }
  }}>
    <div className="dialog-heading"><h2>{title}</h2><button className="icon-button" aria-label={`Close ${title}`} title="Close" onClick={onClose}><X size={22} /></button></div>
    {open && children}
  </dialog>;
}
