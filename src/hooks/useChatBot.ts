import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_MESSAGES = 20;
const RATE_LIMIT_WINDOW = 60_000;
const MAX_PER_WINDOW = 10;

export function useChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const timestamps = useRef<number[]>([]);

  const sendUserMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // Rate limiting
    const now = Date.now();
    timestamps.current = timestamps.current.filter(t => now - t < RATE_LIMIT_WINDOW);
    if (timestamps.current.length >= MAX_PER_WINDOW) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Vous envoyez trop de messages. Veuillez patienter un moment." },
      ]);
      return;
    }
    timestamps.current.push(now);

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages(prev => {
      const next = [...prev, userMsg];
      return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
    });
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].slice(-MAX_MESSAGES);
      const { data, error } = await supabase.functions.invoke("chatbot", {
        body: { messages: history },
      });

      if (error) throw error;

      const content = data?.content || "Désolé, une erreur est survenue. Réessayez.";
      setMessages(prev => {
        const next = [...prev, { role: "assistant" as const, content }];
        return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
      });
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Désolé, une erreur est survenue. Réessayez." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { messages, isLoading, isOpen, toggle, sendUserMessage };
}
