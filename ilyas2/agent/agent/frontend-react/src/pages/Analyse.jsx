import { useState, useContext } from "react";
import { AuthContext, AnalysisContext } from "../App";
import { analyseMeal } from "../api/client";
import { Upload, Camera, X, Loader2, AlertTriangle, Sparkles, MessageCircle, Info, Link } from "lucide-react";

const NUTRIENT_META = {
  calories: { label: "Calories", unit: "kcal", limit: 2000, color: "bg-gold-500" },
  proteines_g: { label: "Protéines", unit: "g", limit: 80, color: "bg-blue-500" },
  glucides_g: { label: "Glucides", unit: "g", limit: 300, color: "bg-amber-500" },
  lipides_g: { label: "Lipides", unit: "g", limit: 70, color: "bg-rose-500" },
  sel_g: { label: "Sodium", unit: "g", limit: 5, color: "bg-purple-500" },
  fibres_g: { label: "Fibres", unit: "g", limit: 30, color: "bg-emerald-500" },
};

function ScoreRing({ score }) {
  const r = 52, circ = 2 * Math.PI * r, offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#d97706" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} className="score-ring-fill" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-extrabold" style={{ color }}>{score}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2 font-medium">Score Santé</p>
    </div>
  );
}

export default function Analyse() {
  const { userToken } = useContext(AuthContext);
  const { analysisResult, setAnalysisResult } = useContext(AnalysisContext);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragover, setDragover] = useState(false);
  const [error, setError] = useState(null);

  function handleFile(f) {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setError(null);
  }

  function handleDrop(e) {
    e.preventDefault(); setDragover(false);
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  }

  async function runAnalysis() {
    if (!file || !userToken) return;
    setLoading(true); setError(null);
    try {
      const result = await analyseMeal(file, userToken);
      setAnalysisResult(result);
      const history = JSON.parse(localStorage.getItem("nv_analysis_history") || "[]");
      history.unshift({ ...result, id: Date.now(), date: new Date().toISOString() });
      localStorage.setItem("nv_analysis_history", JSON.stringify(history.slice(0, 50)));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const data = analysisResult;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Upload */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-gold-600" /> Uploader un repas
          </h3>
        </div>
        <div className="p-6">
          <div className={`upload-zone ${dragover ? "dragover" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
            onDragLeave={() => setDragover(false)}
            onDrop={handleDrop}
            onClick={() => !preview && document.getElementById("file-input").click()}>
            <input id="file-input" type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="Preview" className="max-h-64 rounded-xl mx-auto" />
                <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); document.getElementById("file-input").value = ""; }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gold-400 mx-auto mb-3" />
                <p className="font-semibold text-gray-700">Glissez une photo de repas ici</p>
                <p className="text-sm text-gray-400 mt-1">ou cliquez pour parcourir</p>
                <p className="text-xs text-gray-300 mt-3">JPG, PNG, WEBP</p>
              </>
            )}
          </div>
          <button onClick={runAnalysis} disabled={!file || loading} className="btn-primary w-full mt-4">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyse en cours...</> : <><Sparkles className="w-5 h-5" /> Analyser le repas</>}
          </button>
          {error && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}
        </div>
      </div>

      {data && (
        <>
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Résultats de l'analyse</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-8 mb-6">
                <ScoreRing score={data.analyse?.score ?? 100} />
                <div className="flex-1 w-full">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Aliments détectés</p>
                  <div className="flex flex-wrap gap-2">
                    {(data.aliments || []).map((a, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gold-50 text-gold-700 rounded-full text-sm font-medium border border-gold-200">
                        {a.nom?.replace(/_/g, " ")}<span className="text-gold-400 ml-1">{a.poids_g}g</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {Object.entries(NUTRIENT_META).map(([key, meta]) => {
                  const val = data.nutriments_repas?.[key] || data.analyse?.totals?.[key] || 0;
                  const pct = Math.min((val / meta.limit) * 100, 100);
                  let barColor = meta.color;
                  if (pct > 90) barColor = "bg-red-500";
                  else if (pct > 70) barColor = "bg-amber-500";
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="w-20 text-xs font-semibold text-gray-500 shrink-0">{meta.label}</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-20 text-right text-xs font-bold text-gray-700 shrink-0">
                        {key === "calories" ? Math.round(val) : val.toFixed(1)} {meta.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {data.analyse?.warnings?.length > 0 && (
            <div className="card border-amber-200 bg-amber-50/50">
              <div className="px-6 py-4 border-b border-amber-200">
                <h3 className="font-bold text-amber-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Alertes nutritionnelles</h3>
              </div>
              <div className="p-6 space-y-3">
                {data.analyse.warnings.map((w, i) => (
                  <div key={i} className={`p-3 rounded-xl border-l-4 text-sm ${w.severity === "high" ? "bg-red-50 border-red-400 text-red-800" : "bg-amber-50 border-amber-400 text-amber-800"}`}>
                    {w.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.gemma_reponse && (
            <div className="card border-gold-200">
              <div className="px-6 py-4 border-b border-gold-100 bg-gold-50/50">
                <h3 className="font-bold text-gold-800 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Recommandation Gemma
                </h3>
              </div>
              <div className="p-6">
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">{data.gemma_reponse}</div>
                {data.rag_docs && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs font-semibold text-blue-700 flex items-center gap-1 mb-1"><Info className="w-3.5 h-3.5" /> Sources médicales</p>
                    <p className="text-xs text-blue-600 whitespace-pre-wrap">{data.rag_docs}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {data.historia?.recent_meals?.length > 0 && (
            <div className="card">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Résumé — 7 derniers repas</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">{data.historia.summary}</p>
                <div className="space-y-2">
                  {data.historia.recent_meals.slice(0, 5).map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm">
                      <span className="text-gray-400 text-xs w-16 shrink-0">{new Date(m.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                      <span className="flex-1 text-gray-700 font-medium">{(m.aliments || []).map((a) => a.nom?.replace(/_/g, " ")).join(", ")}</span>
                      <span className="text-gold-600 font-bold text-xs">{Math.round(m.nutriments_repas?.calories || 0)} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
