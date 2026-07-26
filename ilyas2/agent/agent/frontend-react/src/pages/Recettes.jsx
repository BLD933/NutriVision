import { useState } from "react";
import { ChefHat, Sparkles, Clock, Flame, Loader2, Wand2 } from "lucide-react";

const STATIC_RECETTES = [
  { nom: "Couscous aux légumes", time: "45 min", cals: 320, tags: ["Végétarien", "Riche en fibres"], desc: "Couscous complet avec légumes de saison, pois chiches et épices. Faible en sel, idéal pour l'hypertension.", color: "from-amber-50 to-orange-50", border: "border-amber-200" },
  { nom: "Tajine de poulet aux olives", time: "60 min", cals: 380, tags: ["Protéines", "Oméga-3"], desc: "Poulet mijoté avec olives, citrons confits et ras el hanout. Source de protéines maigres.", color: "from-rose-50 to-pink-50", border: "border-rose-200" },
  { nom: "Harira light", time: "50 min", cals: 250, tags: ["Faible glycémie", "Fibres"], desc: "Soupe marocaine allégée aux lentilles, tomates et herbes fraîches. Parfaite pour le diabète.", color: "from-red-50 to-rose-50", border: "border-red-200" },
];

export default function Recettes() {
  const [ingredients, setIngredients] = useState("");
  const [notes, setNotes] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("popular");

  function formatRecipe(text) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold text-gray-900 mt-4 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} className="text-md font-bold text-gold-700 mt-3 mb-1">{line.slice(4)}</h3>;
      if (line.startsWith("**")) {
        const clean = line.replace(/\*\*/g, "");
        if (clean.includes(":") && !clean.startsWith("-")) return <p key={i} className="text-sm font-semibold text-gray-700 mt-1"><span className="text-gold-600">{clean.split(":")[0]}:</span>{clean.split(":").slice(1).join(":")}</p>;
        return <h4 key={i} className="font-bold text-gray-800 mt-2 mb-1">{clean}</h4>;
      }
      if (line.trim().startsWith("- ")) {
        const text = line.trim().slice(2);
        const colonIdx = text.indexOf(":");
        if (colonIdx > 0) {
          return <li key={i} className="text-gray-700 ml-4 list-disc text-sm"><span className="font-medium">{text.slice(0, colonIdx)}:</span>{text.slice(colonIdx + 1)}</li>;
        }
        return <li key={i} className="text-gray-700 ml-4 list-disc text-sm">{text}</li>;
      }
      if (/^\d+\.\s/.test(line.trim())) {
        return <li key={i} className="text-gray-700 ml-4 list-decimal text-sm mb-1">{line.trim().replace(/^\d+\.\s/, "")}</li>;
      }
      if (line.trim() === "") return <div key={i} className="h-1" />;
      return <p key={i} className="text-gray-600 text-sm">{line}</p>;
    });
  }

  async function generateRecipe() {
    if (!ingredients.trim() && !notes.trim()) return;
    setRecipe("");
    setLoading(true);
    setActiveTab("generated");

    const profile = JSON.parse(localStorage.getItem("nv_profile") || "{}");

    try {
      const res = await fetch("/api/recipes/generate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: ingredients.trim(),
          notes: notes.trim(),
          profile: {
            age: profile.age,
            pathologie: profile.pathologie,
            calories_limit: profile.calories_limit,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setRecipe(`Erreur: ${err.error || res.status}`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setLoading(false);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              setRecipe((prev) => prev + parsed.token);
            } catch {}
          }
        }
      }
    } catch (err) {
      setRecipe(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* AI Recipe Generator Section */}
      <div className="card border-gold-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gold-500 to-amber-500 p-5 text-white">
          <div className="flex items-center gap-3">
            <Wand2 className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Générateur de Recettes IA</h2>
              <p className="text-white/80 text-sm">Propulsé par Gemma — des recettes adaptées à votre santé</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Ingrédients disponibles</label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="poulet, tomates, olives, oignons..."
                className="input-field h-20 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Notes / Préférences</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="low-carb, sans gluten, rapide à préparer..."
                className="input-field h-20 resize-none"
              />
            </div>
          </div>
          <button
            onClick={generateRecipe}
            disabled={(!ingredients.trim() && !notes.trim()) || loading}
            className="btn-primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Génération en cours..." : "Générer avec Gemma"}
          </button>
          <p className="text-[10px] text-gray-400 mt-2">Basé sur votre profil — pathologies, calories, restrictions</p>
        </div>
      </div>

      {/* Tabs: Generated Recipe / Popular Recipes */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("generated")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "generated" ? "text-gold-700 border-b-2 border-gold-500" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Sparkles className="w-3.5 h-3.5 inline mr-1" />
          Recette Générée
        </button>
        <button
          onClick={() => setActiveTab("popular")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "popular" ? "text-gold-700 border-b-2 border-gold-500" : "text-gray-500 hover:text-gray-700"}`}
        >
          <ChefHat className="w-3.5 h-3.5 inline mr-1" />
          Recettes populaires
        </button>
      </div>

      {/* Generated Recipe Tab */}
      {activeTab === "generated" && (
        <div className="card">
          {!recipe && !loading && (
            <div className="text-center py-12 text-gray-400">
              <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="font-medium text-lg">Générez une recette personnalisée</p>
              <p className="text-sm mt-1">Entrez vos ingrédients et laissez Gemma créer une recette adaptée à votre santé</p>
            </div>
          )}
          {loading && !recipe && (
            <div className="flex items-center justify-center py-12">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2.5 h-2.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2.5 h-2.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          {recipe && (
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                {formatRecipe(recipe)}
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gold-600 mt-4">
                  <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
                  Génération en cours...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Popular Recipes Tab */}
      {activeTab === "popular" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STATIC_RECETTES.map((r, i) => (
            <div key={i} className={`card overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 border ${r.border}`}>
              <div className={`h-2 bg-gradient-to-r ${r.color}`} />
              <div className="p-5">
                <h4 className="font-bold text-gray-900 mb-2">{r.nom}</h4>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{r.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {r.tags.map((t, j) => (
                    <span key={j} className="px-2 py-0.5 bg-gold-50 text-gold-700 rounded-full text-[10px] font-semibold border border-gold-200">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {r.time}</span>
                  <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {r.cals} kcal</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
