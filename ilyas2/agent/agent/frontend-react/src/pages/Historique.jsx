import { useContext } from "react";
import { AnalysisContext } from "../App";
import { Clock, Utensils } from "lucide-react";

export default function Historique() {
  const { analysisResult } = useContext(AnalysisContext);
  const meals = analysisResult?.historia?.recent_meals || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-600" /> Historique — 7 derniers repas
          </h3>
        </div>
        <div className="p-6">
          {meals.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Utensils className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun repas enregistré</p>
              <p className="text-sm mt-1">Analysez votre premier repas pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((m, i) => {
                const d = new Date(m.created_at);
                const t = m.nutriments_repas || {};
                const score = m.analyse?.score ?? 100;
                let sc = "bg-emerald-100 text-emerald-700";
                if (score < 60) sc = "bg-red-100 text-red-700";
                else if (score < 80) sc = "bg-amber-100 text-amber-700";
                return (
                  <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gold-50/50 transition-colors border border-transparent hover:border-gold-200">
                    <div className="w-16 text-center shrink-0">
                      <p className="text-2xl font-extrabold text-gold-600">{d.getDate()}</p>
                      <p className="text-xs text-gray-400 font-medium">{d.toLocaleString("fr-FR", { month: "short" })}</p>
                      <p className="text-xs text-gray-300 mt-0.5">{d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(m.aliments || []).map((a, j) => (
                          <span key={j} className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700">{a.nom?.replace(/_/g, " ")}</span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span><strong className="text-gray-700">{Math.round(t.calories || 0)}</strong> kcal</span>
                        <span><strong className="text-gray-700">{(t.proteines_g || 0).toFixed(1)}</strong>g prot</span>
                        <span><strong className="text-gray-700">{(t.glucides_g || 0).toFixed(1)}</strong>g gluc</span>
                        <span><strong className="text-gray-700">{(t.sel_g || 0).toFixed(2)}</strong>g sel</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${sc}`}>{score}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {analysisResult?.historia?.summary && (
        <div className="card border-gold-200 bg-gold-50/30">
          <div className="p-6"><p className="text-sm text-gold-800 font-medium">{analysisResult.historia.summary}</p></div>
        </div>
      )}
    </div>
  );
}
