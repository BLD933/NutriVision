import { useState, useRef, useEffect, useContext } from "react";
import { AnalysisContext } from "../App";
import { sendChat } from "../api/client";
import { MessageCircle, X, Send, Bot, User, Loader2, Info } from "lucide-react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Bonjour ! Je suis NutriVision AI. Comment puis-je vous aider aujourd'hui ?\n\n⚠️ Ceci ne remplace pas un avis médical." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);
  const { analysisResult } = useContext(AnalysisContext);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  useEffect(() => {
    const handler = () => { setOpen(true); if (analysisResult?.gemma_reponse) setInput("Puis-je manger ça demain ?"); };
    const el = document.querySelector("[data-chat-open]");
    if (el) el.addEventListener("click", handler);
    return () => { if (el) el.removeEventListener("click", handler); };
  }, [analysisResult]);

  async function sendMessage() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const nutritionCtx = analysisResult ? { aliments: (analysisResult.aliments || []).map((a) => a.nom), totals: analysisResult.analyse?.totals || {}, score: analysisResult.analyse?.score || 100 } : {};
      const profile = JSON.parse(localStorage.getItem("nv_profile") || "{}");
      const data = await sendChat({ message: msg, nutritionCtx, userProfile: { age: profile.age ? Number(profile.age) : undefined, sex: profile.sex, pathologie: profile.pathologie, calories_limit: profile.calories_limit, sodium_limit_mg: profile.sodium_limit_mg, weight: profile.weight ? Number(profile.weight) : undefined, height: profile.height ? Number(profile.height) : undefined } });
      setMessages((prev) => [...prev, { role: "ai", text: data.response }]);
    } catch (err) { setMessages((prev) => [...prev, { role: "ai", text: `Erreur : ${err.message}` }]); }
    finally { setLoading(false); }
  }

  return (
    <>
      <button data-chat-open onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          open ? "bg-gray-800 hover:bg-gray-700" : "bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 hover:shadow-xl hover:scale-105 pulse-gold"
        }`}>
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] chat-panel-enter">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ height: "520px" }}>
            <div className="px-5 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"><Bot className="w-5 h-5" /></div>
                <div><p className="font-bold text-sm">NutriVision AI</p><p className="text-xs text-white/70">Powered by Gemma</p></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "ai" ? "bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-sm" : "bg-gray-900 text-white"}`}>
                    {m.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "ai" ? "chat-bubble-ai" : "chat-bubble-user"}`}>
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white flex items-center justify-center shrink-0 shadow-sm"><Bot className="w-4 h-4" /></div>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-md">
                    <div className="flex gap-1.5">
                      <span className="typing-dot w-2 h-2 bg-gold-400 rounded-full" />
                      <span className="typing-dot w-2 h-2 bg-gold-400 rounded-full" />
                      <span className="typing-dot w-2 h-2 bg-gold-400 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>
            <div className="px-4 py-3 border-t border-gray-100 shrink-0">
              <div className="flex gap-2">
                <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Posez une question..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent" disabled={loading} />
                <button onClick={sendMessage} disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl flex items-center justify-center hover:from-gold-600 hover:to-gold-700 transition-colors disabled:opacity-40 shrink-0 shadow-md shadow-gold-500/20">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1"><Info className="w-3 h-3" /> Pas un substitut pour un avis médical</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
