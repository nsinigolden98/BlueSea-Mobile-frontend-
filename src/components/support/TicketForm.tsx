import React, { useState, useEffect, useRef } from 'react';
import type { CreateTicketPayload } from './types';
import { validateAttachmentFiles } from './utils';
import { X, Send, Paperclip, Video } from 'lucide-react';

interface TicketFormProps {
  initialSubject?: string;
  isSubmitting: boolean;
  onSubmit: (payload: CreateTicketPayload) => void;
  onCancel: () => void;
}

interface PreviewItem {
  url: string;
  isVideo: boolean;
}

export const TicketForm: React.FC<TicketFormProps> = ({
  initialSubject = '',
  isSubmitting,
  onSubmit,
  onCancel,
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [images, setImages] = useState<File[]>([]);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      previewItems.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewItems]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('Please provide a subject for your request.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe your issue in detail.');
      return;
    }
    setError(null);
    onSubmit({
      subject: subject.trim(),
      description: description.trim(),
      priority,
      images,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 md:p-6 mb-6 shadow-lg shadow-slate-200/50 dark:shadow-none relative">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Start a Conversation</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tell us what you need help with.</p>
        </div>
        <button
          onClick={onCancel}
          type="button"
          disabled={isSubmitting}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Wallet funding issue or Airtime pending"
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Priority Level
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all disabled:opacity-60"
          >
            <option value="low">Low - General inquiry</option>
            <option value="medium">Medium - Normal assistance needed</option>
            <option value="high">High - Important service impact</option>
            <option value="urgent">Urgent - Critical transaction failure</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe what happened, including any relevant transaction details..."
            rows={4}
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Attachments <span className="text-slate-400 font-normal">(Optional, up to 3 images or videos, max 2 MB each)</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={isSubmitting || images.length >= 3}
          />
          <div className="flex flex-wrap items-center gap-3">
            {images.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition-all disabled:opacity-60"
              >
                <Paperclip className="w-4 h-4 text-sky-500" />
                <span>Add attachments</span>
              </button>
            )}
            <span className="text-[11px] text-slate-400">
              {images.length}/3 attached
            </span>
          </div>

          {previewItems.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {previewItems.map((item, idx) => (
                <div key={item.url} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                  {item.isVideo ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-sky-400">
                      <Video className="w-6 h-6" />
                    </div>
                  ) : (
                    <img src={item.url} alt={`Attachment preview ${idx + 1}`} className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    disabled={isSubmitting}
                    aria-label={`Remove attachment ${idx + 1}`}
                    className="absolute top-1 right-1 p-1 bg-slate-900/70 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-xs font-medium rounded-xl shadow-sm transition-all disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};