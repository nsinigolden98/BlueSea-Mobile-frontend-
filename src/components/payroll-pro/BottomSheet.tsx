import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showHandle?: boolean;
  maxHeight?: string;
}

export default function BottomSheet({ isOpen, onClose, title, children, showHandle = true, maxHeight = '90vh' }: BottomSheetProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <div className={`tm-bottom-sheet ${isOpen ? 'active' : ''}`}>
      <div className="tm-sheet-overlay" onClick={onClose} />
      <div 
        ref={contentRef}
        className="tm-sheet-content"
        style={{ maxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        {showHandle && <div className="tm-sheet-handle" />}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--tm-text-main)]">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--tm-border-light)] text-[var(--tm-text-muted)] hover:bg-[var(--tm-border)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
