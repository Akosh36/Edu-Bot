import { useState, useCallback } from "react";
import { api } from "@shared/routes";
import { useI18n } from "@/lib/i18n";

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function useChatStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useI18n();

  const sendMessage = useCallback(async (content: string, section?: string) => {
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content };
    const assistantMessageId = (Date.now() + 1).toString();
    
    setMessages(prev => [...prev, userMessage, { id: assistantMessageId, role: 'assistant', content: '' }]);
    setIsLoading(true);

    try {
      const response = await fetch(api.chat.send.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, language, section }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Chat failed');
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');
      
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: msg.content + data.content } 
                    : msg
                ));
              }
            } catch (e) {
              console.error('Failed to parse SSE chunk', e);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId && !msg.content
          ? { ...msg, content: 'An error occurred while connecting to the assistant.' }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  return { messages, sendMessage, isLoading };
}
