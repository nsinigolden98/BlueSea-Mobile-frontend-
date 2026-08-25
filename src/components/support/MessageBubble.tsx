import React from 'react';
import type { SupportMessage } from './types';
import { formatSupportTimestamp } from './utils';
import { cn } from '@/lib/utils';
import { ShieldCheck, User } from 'lucide-react';

interface MessageBubbleProps {
  message: SupportMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAdmin = message.is_admin;

  return (
    <div
      className={cn(
        'flex flex-col max-w-[85%] md:max-w-[75%]',
        isAdmin ? 'mr-auto items-start' : 'ml-auto items-end'
      )}
    >
      <div className="flex items-center gap-1.5 mb-1 px-1">
        {isAdmin ? (
          <>
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              {message.sender_name || 'BlueSea Support'}
            </span>
          </>
        ) : (
          <>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {message.sender_name || 'You'}
            </span>
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </>
        )}
      </div>
      
      <div
        className={cn(
          'p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words w-full',
          isAdmin
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60'
            : 'bg-sky-500 text-white rounded-tr-xs'
        )}
      >
        {message.message}

        {/* Attachments rendering */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.attachments.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block shrink-0"
              >
                <img
                  src={url}
                  alt="Attached screenshot"
                  className={cn(
                    "w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border hover:opacity-90 transition-opacity",
                    isAdmin ? "border-slate-300 dark:border-slate-600" : "border-sky-400"
                  )}
                />
              </a>
            ))}
          </div>
        )}
      </div>
      
      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
        {formatSupportTimestamp(message.created_at)}
      </span>
    </div>
  );
};
