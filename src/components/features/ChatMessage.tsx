import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full gap-2 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-zinc-100 text-zinc-900 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700'
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div
        className={`relative max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-xs ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white text-zinc-900 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <span className="text-[10px] opacity-50 block mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};
