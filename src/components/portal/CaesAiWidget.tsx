"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, MessageCircle } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string };

/**
 * Simulasi respons CaesAi di sisi client.
 */
function getMockReply(): string {
  const replies = [
    "Terima kasih atas pertanyaannya! Fitur AI CaesAi masih dalam pengembangan, jawaban pintar akan segera hadir.",
    "Catat! Nanti tim kami akan bantu jawab lebih lengkap ya.",
    "CaesAi masih belajar nih, sementara ini kamu bisa datang atau hubungi toko langsung untuk bantuan lebih lanjut.",
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

export default function CaesAiWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Halo! Aku CaesAi. Ada yang bisa dibantu seputar produk di toko kami?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: getMockReply() }]);
      setTyping(false);
    }, 900);
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 w-[320px] sm:w-[360px] h-[440px] bg-white border border-neutral-200 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-scale-in">
          <div className="bg-primary-700 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">CaesAi</div>
                <div className="text-[11px] text-primary-200">Asisten belanja</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-primary-200 hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-neutral-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[80%] text-sm px-3 py-2 rounded-2xl ${
                  m.role === "user"
                    ? "bg-primary-700 text-white ml-auto rounded-br-sm"
                    : "bg-white border border-neutral-200 text-neutral-700 rounded-bl-sm shadow-xs"
                }`}
              >
                {m.text}
              </div>
            ))}
            {typing && (
              <div className="bg-white border border-neutral-200 text-neutral-400 text-sm px-3 py-2 rounded-2xl rounded-bl-sm w-fit animate-pulse">
                CaesAi mengetik...
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="border-t border-neutral-100 p-2.5 flex gap-2 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaan..."
              className="flex-1 text-sm border border-neutral-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
            />
            <button
              type="submit"
              className="h-9 w-9 rounded-full bg-primary-700 hover:bg-primary-800 text-white flex items-center justify-center shrink-0 transition-colors"
              aria-label="Kirim"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="h-14 w-14 rounded-full bg-primary-700 text-white shadow-lg flex items-center justify-center hover:bg-primary-800 active:scale-95 transition-all duration-150"
        aria-label="CaesAi"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
