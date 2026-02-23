import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useChatStream } from "@/hooks/use-chat";
import { useI18n, translations } from "@/lib/i18n";
import { useLocation } from "wouter";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, isLoading } = useChatStream();
  const { language } = useI18n();
  const t = translations[language];
  const [location] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Derive section from URL context
  const sectionMatch = location.match(/^\/sections\/([^\/]+)/);
  const currentSection = sectionMatch ? sectionMatch[1] : undefined;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input, currentSection);
    setInput("");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-20 right-4 md:right-8 w-[calc(100vw-32px)] md:w-[400px] z-50 shadow-2xl"
          >
            <Card className="flex flex-col h-[500px] max-h-[80vh] overflow-hidden border-border/50 shadow-indigo-900/10">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold leading-none">{t.chatTitle}</h3>
                    <p className="text-xs text-primary-foreground/80 opacity-90 font-medium mt-0.5">
                      {currentSection ? `Context: ${currentSection}` : t.askAI}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary-foreground hover:bg-white/20 rounded-full"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-zinc-900/50"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-3 opacity-60">
                    <Bot className="w-12 h-12" />
                    <p className="max-w-[200px] text-sm">{t.heroSubtitle}</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-br-sm shadow-sm' 
                          : 'bg-white dark:bg-zinc-800 border border-border/50 text-foreground rounded-bl-sm shadow-sm'
                      }`}>
                        <ReactMarkdown className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:my-0">
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white dark:bg-zinc-950 border-t border-border/50">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.chatPlaceholder}
                    className="flex-1 bg-slate-50 dark:bg-zinc-900 border-border/50 focus-visible:ring-primary/20 rounded-xl"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!input.trim() || isLoading}
                    className="rounded-xl bg-primary hover:bg-primary/90 shadow-sm transition-all duration-200"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-gradient-to-tr from-primary to-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 z-50 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </>
  );
}
