import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useChatBot, ChatMessage } from "@/hooks/useChatBot";
import { cn } from "@/lib/utils";

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Bonjour ! 👋 Je suis l'assistant Bénin Phone Trace. Je peux vous aider à :\n\n• Déclarer un téléphone volé\n• Vérifier un numéro IMEI\n• Comprendre les démarches à suivre\n\nComment puis-je vous aider ?",
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatBot() {
  const { messages, isLoading, isOpen, toggle, sendUserMessage } = useChatBot();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allMessages = [WELCOME_MESSAGE, ...messages];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages.length, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendUserMessage(trimmed);
    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggle}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110",
          !isOpen && "animate-pulse"
        )}
        aria-label="Ouvrir le chatbot"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] rounded-2xl border bg-background shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-75 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground">
          <span className="font-semibold text-sm">Assistant Bénin Phone Trace 🤖</span>
          <button onClick={toggle} className="hover:opacity-80 transition-opacity" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {allMessages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {isLoading && <TypingIndicator />}
        </div>

        {/* Input */}
        <div className="border-t p-3 flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Posez votre question..."
            disabled={isLoading}
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-primary text-primary-foreground px-3 py-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
            aria-label="Envoyer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
