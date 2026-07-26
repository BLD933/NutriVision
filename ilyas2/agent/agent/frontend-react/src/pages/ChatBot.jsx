import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext, AnalysisContext } from "../App";
import { sendChat, sendChatStream } from "../api/client";
import { Send, Bot, User, Loader2, Info, Sparkles, Trash2 } from "lucide-react";

const QUICK_QUESTIONS = [
  "Analyse mon dernier repas",
  "Puis-je manger ça demain ?",
  "Suggère-moi un repas sain",
  "Quels aliments éviter avec mon-diabète ?",
  "Donne-moi une recette low-carb",
  "Calcule mes calories quotidiennes",
];

export default function ChatBot() {
  const { userToken } = useContext(AuthContext);
  const { analysisResult } = useContext(AnalysisContext);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Bonjour ! Je suis **NutriBot**, votre assistant nutritionnel intelligent powered by Gemma AI.\n\nJe peux vous aider à :\n- Analyser vos repas et leur valeur nutritionnelle\n- Créer des plans alimentaires personnalisés\n- Répondre à vos questions sur la nutrition\n- Gérer les restrictions liées à vos pathologies\n\n⚠️ Ceci ne remplace pas un avis médical professionnel.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    const lastUserMsg = msg;

    const nutritionCtx = analysisResult
      ? { aliments: (analysisResult.aliments || []).map((a) => a.nom), totals: analysisResult.analyse?.totals || {}, score: analysisResult.analyse?.score || 100 }
      : {};

    const profile = JSON.parse(localStorage.getItem("nv_profile") || "{}");
    const userProfile = {
      age: profile.age ? Number(profile.age) : undefined,
      sex: profile.sex,
      pathologie: profile.pathologie,
      calories_limit: profile.calories_limit,
      sodium_limit_mg: profile.sodium_limit_mg,
      weight: profile.weight ? Number(profile.weight) : undefined,
      height: profile.height ? Number(profile.height) : undefined,
    };

    // Add placeholder AI message for streaming
    const msgIdx = messages.length;
    setMessages((prev) => [...prev, { role: "ai", text: "", _streaming: true }]);

    sendChatStream({
      message: msg,
      nutritionCtx,
      userProfile,
      onToken: (token) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = { ...updated[updated.length - 1] };
          last.text += token;
          updated[updated.length - 1] = last;
          return updated;
        });
      },
      onDone: () => {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            const last = { ...updated[updated.length - 1] };
            delete last._streaming;
            updated[updated.length - 1] = last;
          }
          const history = JSON.parse(localStorage.getItem("nv_chat_history") || "[]");
          const aiMsg = updated[updated.length - 1]?.text || "";
          history.unshift({ id: Date.now(), user: lastUserMsg, ai: aiMsg, date: new Date().toISOString() });
          localStorage.setItem("nv_chat_history", JSON.stringify(history.slice(0, 100)));
          return updated;
        });
        setLoading(false);
      },
      onError: (err) => {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === "ai" && updated[updated.length - 1]._streaming) {
            updated[updated.length - 1] = { role: "ai", text: `Désolé, une erreur est survenue : ${err.message}` };
          } else {
            updated.push({ role: "ai", text: `Désolé, une erreur est survenue : ${err.message}` });
          }
          return updated;
        });
        setLoading(false);
      },
    });
  }

  function clearChat() {
    setMessages([
      { role: "ai", text: "Chat réinitialisé. Comment puis-je vous aider ?" },
    ]);
  }

  function formatText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      {/* Header */}
      <div className="card mb-4 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              NutriBot AI <span className="text-[10px] px-2 py-0.5 bg-gold-100 text-gold-700 rounded-full font-semibold">Gemma</span>
            </h3>
            <p className="text-xs text-gray-500">Assistant nutrition intelligent — en ligne</p>
          </div>
        </div>
        <button onClick={clearChat} className="btn-danger text-xs !px-3 !py-1.5">
          <Trash2 className="w-3.5 h-3.5" /> Vider
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.role === "ai" ? "bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-md shadow-gold-500/20" : "bg-gray-900 text-white"}`}>
                {m.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`max-w-[75%] ${m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
                <div dangerouslySetInnerHTML={{ __html: formatText(m.text) }} />
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-gold-500/20">
                <Bot className="w-4 h-4" />
              </div>
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

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-3 flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)} className="px-3 py-1.5 bg-gold-50 text-gold-700 rounded-full text-xs font-medium border border-gold-200 hover:bg-gold-100 transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Posez une question nutrition..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              disabled={loading}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl flex items-center justify-center hover:from-gold-600 hover:to-gold-700 transition-all disabled:opacity-40 shrink-0 shadow-md shadow-gold-500/20">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" /> Pas un substitut pour un avis médical
          </p>
        </div>
      </div>
    </div>
  );
}
