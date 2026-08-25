import React, { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Send, Lock, Plus, Paperclip, X } from 'lucide-react';

interface MessageComposerProps {
  isClosed: boolean;
  isSending: boolean;
  onSendMessage: (messageText: string, images?: File[]) => Promise<boolean>;
  onStartNewTicket?: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  isClosed,
  isSending,
  onSendMessage,
  onStartNewTicket,
}) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = images.map(img => URL.createObjectURL(img));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [images]);

  if (isClosed) {
    return (
      <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>This conversation is closed. If you still need help, you can start a new request.</span>
        </div>
        {onStartNewTicket && (
          <div>
            <button
              onClick={onStartNewTicket}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Start a new conversation
            </button>
          </div>
        )}
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImageError(null);

    const validImages = files.filter(f => f.type.startsWith('image/'));
    if (validImages.length !== files.length) {
      setImageError('Only image files are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (images.length + validImages.length > 3) {
      setImageError('You can attach a maximum of 3 screenshots.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImages(prev => [...prev, ...validImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageError(null);
  };

  const handleSend = async () => {
    if ((!text.trim() && images.length === 0) || isSending) return;
    
    const currentText = text;
    const currentImages = [...images];
    
    const success = await onSendMessage(currentText, currentImages);
    if (success) {
      setText('');
      setImages([]);
      setImageError(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 md:p-4 bg-white dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-800 flex flex-col">
      {imageError && (
        <div className="mb-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
          {imageError}
        </div>
      )}

      {previewUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 px-1">
          {previewUrls.map((url, i) => (
            <div key={i} className="relative group shrink-0">
              <img src={url} alt={`Attachment ${i + 1}`} className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                disabled={isSending}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 hover:text-red-500 shadow-sm transition-colors"
                aria-label="Remove screenshot"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
          disabled={isSending || images.length >= 3}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending || images.length >= 3}
          className="p-2 text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 disabled:opacity-50 transition-colors shrink-0"
          aria-label="Attach screenshot"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows={1}
          disabled={isSending}
          className="flex-1 bg-transparent px-2 py-1.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none resize-none max-h-32 min-h-[38px] disabled:opacity-60"
        />
        <button
          onClick={handleSend}
          disabled={(!text.trim() && images.length === 0) || isSending}
          type="button"
          className="p-2.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl transition-all shrink-0 focus:outline-none"
          aria-label="Send message"
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
