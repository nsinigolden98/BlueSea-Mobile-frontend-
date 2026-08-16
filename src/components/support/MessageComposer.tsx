import React, { useState, type KeyboardEvent } from 'react';
import { Send, Lock, Plus } from 'lucide-react';

interface MessageComposerProps {
  isClosed: boolean;
  isSending: boolean;
  onSendMessage: (messageText: string) => Promise<boolean>;
  onStartNewTicket?: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  isClosed,
  isSending,
  onSendMessage,
  onStartNewTicket,
}) => {
  const [text, setText] = useState('');

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

  const handleSend = async () => {
    if (!text.trim() || isSending) return;
    const currentText = text;
    const success = await onSendMessage(currentText);
    if (success) {
      setText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 md:p-4 bg-white dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all">
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
          disabled={!text.trim() || isSending}
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
