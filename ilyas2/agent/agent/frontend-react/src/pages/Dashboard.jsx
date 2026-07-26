import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ScanLine, Flame, TriangleAlert, Star, Clock, MessageCircle,
  ArrowRight, TrendingUp, Utensils, CalendarCheck, Users, Sparkles, Plus,
} from "lucide-react";

const DAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function groupByDay(entries) {
  const days = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days[key] = { label: i === 0 ? "Aujourd'hui" : DAY_NAMES[d.getDay()], date: key, cals: 0, count: 0 };
  }
  for (const e of entries) {
    const key = e.date?.slice(0, 10);
    if (days[key]) {
      days[key].cals += Math.round(e.nutriments_repas?.calories || 0);
      days[key].count += 1;
    }
  }
  return Object.values(days);
}

export default function Dashboard() {
  const data = useMemo(() => {
    const analyses = (() => { try { return JSON.parse(localStorage.getItem("nv_analysis_history")) || []; } catch { return []; } })();
    const plans = (() => { try { return JSON.parse(localStorage.getItem("nv_meal_plans")) || []; } catch { return []; } })();
    const chats = (() => { try { return JSON.parse(localStorage.getItem("nv_chat_history")) || []; } catch { return []; } })();
    const profile = (() => { try { return JSON.parse(localStorage.getItem("nv_user_profile")) || {}; } catch { return {}; } })();

    const totalMeals = analyses.length;
    const avgCals = totalMeals > 0 ? Math.round(analyses.reduce((s, a) => s + (a.nutriments_repas?.calories || 0), 0) / totalMeals) : 0;
    const totalWarnings = analyses.reduce((s, a) => s + (a.analyse?.warnings?.length || 0), 0);
    const scores = analyses.filter((a) => a.analyse?.score != null).map((a) => a.analyse.score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null;
    const calGoal = profile.calories_limit ? Number(profile.calories_limit) : 2000;

    const weekDays = groupByDay(analyses);

    const recentAnalyses = analyses.slice(0, 5);

    const activity = [
      ...analyses.slice(0, 10).map((a) => ({ type: "analyse", date: a.date, label: `${(a.aliments || []).map((x) => x.nom?.replace(/_/g, " ")).join(", ") || "Repas"}`, cals: Math.round(a.nutriments_repas?.calories || 0) })),
      ...chats.slice(0, 10).map((c) => ({ type: "chat", date: c.date, label: c.user?.slice(0, 60) })),
      ...plans.slice(0, 5).map((p) => ({ type: "plan", date: p.createdAt, label: `Plan pour ${p.clientName || "client"}` })),
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 8);

    return { totalMeals, avgCals, totalWarnings, avgScore, calGoal, weekDays, recentAnalyses, activity, analyses, chats, plans };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Hero */}
      <div className="card p-8 bg-gradient-to-r from-gray-950 via-gray-900 to-gold-950 text-white border-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-gold-500 rounded-full blur-[100px]" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-gold-400" />
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">NutriVision AI</span>
          </div>
          <h2 className="text-3xl font-extrabold mb-2">
            Tableau de bord
          </h2>
          <p className="text-gray-400 max-w-lg">
            {data.totalMeals > 0
              ? `${data.totalMeals} repas analysés, ${data.chats.length} conversations NutriBot, ${data.plans.length} plans créés`
              : "Analysez vos repas, suivez votre nutrition et obtenez des recommandations personnalisées grâce à l'IA Gemma."}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/analyse" className="btn-primary">
              <ScanLine className="w-4 h-4" /> Scanner un repas
            </Link>
            <Link to="/chatbot" className="btn-secondary !bg-white/10 !border-white/20 !text-white hover:!bg-white/20">
              <MessageCircle className="w-4 h-4" /> NutriBot AI
            </Link>
            <Link to="/meal-plan" className="btn-secondary !bg-white/10 !border-white/20 !text-white hover:!bg-white/20">
              <CalendarCheck className="w-4 h-4" /> Meal Planning
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center text-gold-600"><Utensils className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold">{data.totalMeals}</p><p className="text-xs text-gray-500 font-medium">Repas analysés</p></div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600"><Flame className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold">{data.avgCals > 0 ? data.avgCals : "—"}</p><p className="text-xs text-gray-500 font-medium">Calories moy.</p></div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><TriangleAlert className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold">{data.totalWarnings}</p><p className="text-xs text-gray-500 font-medium">Alertes</p></div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center text-gold-600"><Star className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold">{data.avgScore != null ? `${data.avgScore}/100` : "—"}</p><p className="text-xs text-gray-500 font-medium">Score santé</p></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Nutrition */}
        <div className="card lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Résumé hebdomadaire</h3>
          </div>
          <div className="p-6">
            {data.totalMeals > 0 ? (
              <div className="space-y-3">
                {data.weekDays.map((d) => (
                  <div key={d.date} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-semibold text-gray-500 shrink-0">{d.label}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-700"
                        style={{ width: `${Math.min((d.cals / (data.calGoal || 2000)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="w-20 text-right text-xs font-bold text-gray-700 shrink-0">
                      {d.cals > 0 ? `${d.cals} kcal` : "—"}
                    </span>
                    {d.count > 0 && <span className="text-[10px] text-gray-400 w-8 shrink-0">{d.count} repas</span>}
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 text-xs text-gray-400 border-t border-gray-100">
                  <span>Objectif: {data.calGoal} kcal/jour</span>
                  <span>
                    {data.weekDays.filter((d) => d.cals > 0).length > 0
                      ? `Moy. ${Math.round(data.weekDays.filter((d) => d.cals > 0).reduce((s, d) => s + d.cals, 0) / data.weekDays.filter((d) => d.cals > 0).length)} kcal/j`
                      : "Aucune donnée"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Flame className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Aucune donnée cette semaine</p>
                <p className="text-xs mt-1">Scannez des repas pour voir votre résumé</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Activité récente</h3>
          </div>
          <div className="p-4 space-y-1 max-h-[400px] overflow-y-auto">
            {data.activity.length > 0 ? (
              data.activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    a.type === "analyse" ? "bg-gold-50 text-gold-600" :
                    a.type === "chat" ? "bg-purple-50 text-purple-600" :
                    "bg-blue-50 text-blue-600"
                  }`}>
                    {a.type === "analyse" ? <ScanLine className="w-4 h-4" /> :
                     a.type === "chat" ? <MessageCircle className="w-4 h-4" /> :
                     <CalendarCheck className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{a.label || "Repas analysé"}</p>
                    <p className="text-[10px] text-gray-400">
                      {a.cals ? `${a.cals} kcal · ` : ""}
                      {a.date ? (() => { const d = new Date(a.date); const now = new Date(); const diff = Math.round((now - d) / 60000); if (diff < 1) return "À l'instant"; if (diff < 60) return `Il y a ${diff} min`; if (diff < 1440) return `Il y a ${Math.round(diff / 60)}h`; return d.toLocaleDateString("fr-FR"); })() : ""}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium">Aucune activité</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Meal History */}
        <div className="card lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Historique des repas</h3>
            {data.recentAnalyses.length > 0 && (
              <Link to="/analyse" className="text-sm text-gold-600 font-medium hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          <div className="p-4 space-y-2">
            {data.recentAnalyses.length > 0 ? (
              data.recentAnalyses.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm">
                  <span className="text-gray-400 text-xs w-16 shrink-0">
                    {a.date ? new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "—"}
                  </span>
                  <span className="flex-1 text-gray-700 font-medium truncate">
                    {(a.aliments || []).map((al) => al.nom?.replace(/_/g, " ")).join(", ") || "Repas analysé"}
                  </span>
                  <span className={`text-xs font-bold ${(a.analyse?.score || 0) >= 80 ? "text-emerald-600" : (a.analyse?.score || 0) >= 60 ? "text-amber-600" : "text-red-600"}`}>
                    {a.analyse?.score != null ? `${a.analyse.score}` : ""}
                  </span>
                  <span className="text-gold-600 font-bold text-xs">{Math.round(a.nutriments_repas?.calories || 0)} kcal</span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                <ScanLine className="w-14 h-14 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Aucun repas analysé</p>
                <p className="text-xs mt-1">Uploadez une photo de repas pour commencer</p>
                <Link to="/analyse" className="btn-primary mt-4 inline-flex text-sm">
                  <Plus className="w-4 h-4" /> Première analyse
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Actions rapides</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
            {[
              { to: "/analyse", icon: ScanLine, label: "Scanner", desc: `${data.totalMeals} analyses` },
              { to: "/chatbot", icon: MessageCircle, label: "NutriBot", desc: `${data.chats.length} messages` },
              { to: "/meal-plan", icon: CalendarCheck, label: "Meal Plan", desc: `${data.plans.length} plans` },
              { to: "/clients", icon: Users, label: "Clients", desc: "Gérer clients" },
              { to: "/recettes", icon: TrendingUp, label: "Recettes", desc: "Générer recettes" },
              { to: "/historique", icon: Clock, label: "Historique", desc: "Voir tout" },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-gold-300 hover:bg-gold-50 transition-all">
                <a.icon className="w-5 h-5 text-gold-600" />
                <span className="text-xs font-semibold text-gray-700">{a.label}</span>
                <span className="text-[10px] text-gray-400">{a.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
