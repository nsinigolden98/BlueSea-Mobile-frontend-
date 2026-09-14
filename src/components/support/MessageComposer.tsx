import React, { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { validateAttachmentFiles } from './utils';
import { Send, Lock, Plus, Paperclip, X, Video } from 'lucide-react';

interface MessageComposerProps {
  isClosed: boolean;
  isSending: boolean;
  onSendMessage: (messageText: string, images?: File[]) => Promise<boolean>;
  onStartNewTicket?: () => void;
}

interface PreviewItem {
  url: string;
  isVideo: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  isClosed,
  isSending,
  onSendMessage,
  onStartNewTicket,
}) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      previewItems.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewItems]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const { validFiles, errorMessage } = validateAttachmentFiles(selectedFiles, images.length, 3);

    if (errorMessage) {
      setError(errorMessage);
    } else {
      setError(null);
    }

    if (validFiles.length > 0) {
      const newPreviews = validFiles.map((file) => ({
        url: URL.createObjectURL(file),
        isVideo: file.type.startsWith('video/'),
      }));

      setImages((prev) => [...prev, ...validFiles]);
      setPreviewItems((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewItems[index].url);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewItems((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleSend = async () => {
    if ((!text.trim() && images.length === 0) || isSending) return;
    const currentText = text;
    const currentImages = images;
    const success = await onSendMessage(currentText, currentImages);
    if (success) {
      setText('');
      previewItems.forEach((item) => URL.revokeObjectURL(item.url));
      setImages([]);
      setPreviewItems([]);
      setError(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (text.trim().length > 0 || images.length > 0) && !isSending;

  return (
    <div className="p-3 md:p-4 bg-white dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-800">
      {error && (
        <div className="mb-2 p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {previewItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          {previewItems.map((item, idx) => (
            <div key={item.url} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              {item.isVideo ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-sky-400">
                  <Video className="w-5 h-5" />
                </div>
              ) : (
                <img src={item.url} alt={`Attachment preview ${idx + 1}`} className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                disabled={isSending}
                aria-label={`Remove attachment ${idx + 1}`}
                className="absolute top-1 right-1 p-1 bg-slate-900/70 hover:bg-red-600 text-white rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isSending || images.length >= 3}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending || images.length >= 3}
          className="p-2 text-slate-400 hover:text-sky-500 dark:text-slate-500 dark:hover:text-sky-400 transition-colors disabled:opacity-40 shrink-0"
          aria-label="Add attachment"
          title={images.length >= 3 ? 'Maximum 3 attachments reached' : 'Add attachment'}
        >
          <Paperclip className="w-5 h-5" />
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
          disabled={!canSend}
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