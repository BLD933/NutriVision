import { useState, useRef } from "react";
import {
  CalendarCheck, Plus, Trash2, Clock, Utensils, Target, AlertTriangle,
  ChevronDown, ChevronUp, Save, Sparkles, Dumbbell, Heart, Baby, Salad,
  Wand2, Loader2,
} from "lucide-react";
import { sendStream } from "../api/client";

const GOALS = [
  { id: "perte", label: "Perte de poids", icon: Dumbbell, color: "text-red-600 bg-red-50" },
  { id: "prise", label: "Prise de masse", icon: Target, color: "text-blue-600 bg-blue-50" },
  { id: "entretien", label: "Entretien", icon: Heart, color: "text-gold-600 bg-gold-50" },
  { id: "diabete", label: "Diabète", icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
  { id: "hypertension", label: "Hypertension", icon: Heart, color: "text-rose-600 bg-rose-50" },
  { id: "sportif", label: "Performance sportive", icon: Dumbbell, color: "text-purple-600 bg-purple-50" },
  { id: "grossesse", label: "Grossesse", icon: Baby, color: "text-pink-600 bg-pink-50" },
  { id: "vegan", label: "Végan/Végétarien", icon: Salad, color: "text-emerald-600 bg-emerald-50" },
];

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MEALS = ["Petit-déjeuner", "Déjeuner", "Collation", "Dîner"];

const EMPTY_PLAN = () => ({
  clientName: "",
  goal: "",
  restrictions: "",
  allergies: "",
  duration: "1 semaine",
  notes: "",
  days: DAYS.reduce((acc, day) => {
    acc[day] = MEALS.reduce((macc, meal) => {
      macc[meal] = { name: "", calories: "", notes: "" };
      return macc;
    }, {});
    return acc;
  }, {}),
});

export default function MealPlan() {
  const [plans, setPlans] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nv_meal_plans")) || []; } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(EMPTY_PLAN());
  const [expandedDay, setExpandedDay] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const planRef = useRef(null);

  function generateWithAI() {
    setAiGenerating(true);
    setAiResult("");
    const profile = (() => {
      try { return JSON.parse(localStorage.getItem("nv_user_profile")); } catch { return {}; }
    })();

    sendStream({
      endpoint: "/meal-plan/generate/stream",
      body: {
        goal: currentPlan.goal,
        restrictions: currentPlan.restrictions,
        allergies: currentPlan.allergies,
        duration: currentPlan.duration,
        notes: currentPlan.notes,
        profile,
      },
      onToken: (token) => setAiResult((prev) => prev + token),
      onDone: () => setAiGenerating(false),
      onError: () => setAiGenerating(false),
    });
  }

  function fillGridFromAI() {
    const planCopy = { ...currentPlan };
    const dayNames = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    const mealNames = ["Petit-déjeuner", "Déjeuner", "Collation", "Dîner"];
    const lines = aiResult.split("\n");

    let currentDay = null;
    for (const line of lines) {
      const dayMatch = line.match(/^##\s+(.+)/);
      if (dayMatch) {
        const candidate = dayMatch[1].trim();
        if (dayNames.includes(candidate)) {
          currentDay = candidate;
        }
        continue;
      }
      if (!currentDay) continue;

      const mealMatch = line.match(/^\*\*(.+?):\*\*\s*(.+)/);
      if (mealMatch) {
        const mealName = mealMatch[1].trim();
        if (!dayNames.includes(currentDay) || !mealNames.includes(mealName)) continue;

        const rest = mealMatch[2].trim();
        let dishName = rest;
        let cal = "";
        let note = "";

        const calMatch = rest.match(/[\(~](\d{2,4})\s*kcal/);
        if (calMatch) {
          cal = calMatch[1];
          dishName = rest.replace(/\s*[\(~].*?\d{2,4}\s*kcal[\)]?\s*/, "").trim();
        }

        const sepMatch = dishName.match(/\s*(?:—|–|-)\s*/);
        if (sepMatch) {
          const parts = dishName.split(sepMatch[0]);
          dishName = parts[0].trim();
          note = parts.slice(1).join(" ").trim();
        }

        if (!planCopy.days[currentDay]) planCopy.days[currentDay] = {};
        planCopy.days[currentDay] = {
          ...planCopy.days[currentDay],
          [mealName]: { name: dishName, calories: cal, notes: note },
        };
      }
    }

    setCurrentPlan(planCopy);
    setTimeout(() => planRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function savePlan() {
    const updated = [...plans, { ...currentPlan, id: Date.now(), createdAt: new Date().toISOString() }];
    setPlans(updated);
    localStorage.setItem("nv_meal_plans", JSON.stringify(updated));
    setCurrentPlan(EMPTY_PLAN());
    setShowForm(false);
  }

  function deletePlan(id) {
    const updated = plans.filter((p) => p.id !== id);
    setPlans(updated);
    localStorage.setItem("nv_meal_plans", JSON.stringify(updated));
  }

  function updateMeal(day, meal, field, value) {
    setCurrentPlan((prev) => ({
      ...prev,
      days: { ...prev.days, [day]: { ...prev.days[day], [meal]: { ...prev.days[day][meal], [field]: value } } },
    }));
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-r from-gray-950 via-gray-900 to-gold-950 text-white border-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-gold-500 rounded-full blur-[100px]" />
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck className="w-5 h-5 text-gold-400" />
              <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Meal Planning</span>
            </div>
            <h2 className="text-2xl font-extrabold">Planification Nutritionnelle</h2>
            <p className="text-gray-400 text-sm mt-1">Créez des plans de repas personnalisés pour vos clients</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="w-4 h-4" /> Nouveau plan
          </button>
        </div>
      </div>

      {/* New Plan Form */}
      {showForm && (
        <div className="card border-gold-200">
          <div className="px-6 py-4 border-b border-gold-100 bg-gold-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-600" /> Nouveau plan nutritionnel
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Client & Goal */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Nom du client</label>
                <input type="text" value={currentPlan.clientName} onChange={(e) => setCurrentPlan({ ...currentPlan, clientName: e.target.value })} placeholder="Ex: Ahmed Benali" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Durée</label>
                <select value={currentPlan.duration} onChange={(e) => setCurrentPlan({ ...currentPlan, duration: e.target.value })} className="input-field">
                  <option>1 semaine</option>
                  <option>2 semaines</option>
                  <option>1 mois</option>
                  <option>3 mois</option>
                </select>
              </div>
            </div>

            {/* Goal Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 ml-1">Objectif du régime</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setCurrentPlan({ ...currentPlan, goal: g.id })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      currentPlan.goal === g.id
                        ? "border-gold-500 bg-gold-50 shadow-sm"
                        : "border-gray-200 hover:border-gold-300"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${g.color}`}>
                      <g.icon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-gray-800">{g.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Restrictions & Allergies */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Restrictions alimentaires</label>
                <textarea value={currentPlan.restrictions} onChange={(e) => setCurrentPlan({ ...currentPlan, restrictions: e.target.value })} placeholder="Ex: Sans gluten, faible en sodium, low-carb..." className="input-field h-20 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Allergies</label>
                <textarea value={currentPlan.allergies} onChange={(e) => setCurrentPlan({ ...currentPlan, allergies: e.target.value })} placeholder="Ex: Noix, lactose, fruits de mer..." className="input-field h-20 resize-none" />
              </div>
            </div>

            {/* Weekly Plan */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 ml-1">Plan hebdomadaire</label>
              <div className="space-y-2">
                {DAYS.map((day) => (
                  <div key={day} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gold-50 transition-colors"
                    >
                      <span className="text-sm font-bold text-gray-800">{day}</span>
                      {expandedDay === day ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {expandedDay === day && (
                      <div className="p-4 grid sm:grid-cols-2 gap-3">
                        {MEALS.map((meal) => (
                          <div key={meal} className="p-3 bg-gray-50 rounded-xl space-y-2">
                            <p className="text-xs font-semibold text-gold-700 flex items-center gap-1">
                              <Utensils className="w-3 h-3" /> {meal}
                            </p>
                            <input type="text" value={currentPlan.days[day]?.[meal]?.name || ""} onChange={(e) => updateMeal(day, meal, "name", e.target.value)} placeholder="Plat..." className="input-field !py-2 text-xs" />
                            <div className="flex gap-2">
                              <input type="number" value={currentPlan.days[day]?.[meal]?.calories || ""} onChange={(e) => updateMeal(day, meal, "calories", e.target.value)} placeholder="kcal" className="input-field !py-2 text-xs flex-1" />
                              <input type="text" value={currentPlan.days[day]?.[meal]?.notes || ""} onChange={(e) => updateMeal(day, meal, "notes", e.target.value)} placeholder="Notes..." className="input-field !py-2 text-xs flex-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Notes du coach</label>
              <textarea value={currentPlan.notes} onChange={(e) => setCurrentPlan({ ...currentPlan, notes: e.target.value })} placeholder="Instructions supplémentaires, objectifs à long terme..." className="input-field h-20 resize-none" />
            </div>

            {/* AI Generation */}
            <div ref={planRef} className="border-2 border-dashed border-gold-300 rounded-xl p-5 bg-gold-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-gold-600" /> Génération IA
                </h4>
                <button
                  onClick={generateWithAI}
                  disabled={aiGenerating || !currentPlan.goal}
                  className={`btn-primary !py-2 !text-sm ${(!currentPlan.goal || aiGenerating) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {aiGenerating ? "Génération..." : "Générer avec Gemma"}
                </button>
              </div>

              {aiResult && (
                <div className="bg-white rounded-xl p-4 border border-gold-200 max-h-80 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {aiResult}
                </div>
              )}

              {aiResult && !aiGenerating && (
                <button onClick={fillGridFromAI} className="btn-secondary !py-2 !text-sm">
                  <Save className="w-4 h-4" /> Remplir la grille
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={savePlan} className="btn-primary"><Save className="w-4 h-4" /> Enregistrer le plan</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Plans */}
      {plans.length === 0 && !showForm ? (
        <div className="card p-12 text-center text-gray-400">
          <CalendarCheck className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="font-medium text-lg">Aucun plan nutritionnel</p>
          <p className="text-sm mt-1">Créez votre premier plan pour commencer</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const goal = GOALS.find((g) => g.id === plan.goal);
            return (
              <div key={plan.id} className="card hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{plan.clientName || "Client sans nom"}</h4>
                      <p className="text-xs text-gray-500">{plan.duration} — {new Date(plan.createdAt).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <button onClick={() => deletePlan(plan.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {goal && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${goal.color}`}>
                      <goal.icon className="w-3 h-3" /> {goal.label}
                    </span>
                  )}
                  {plan.restrictions && (
                    <p className="text-xs text-gray-600 mb-1"><strong>Restrictions:</strong> {plan.restrictions}</p>
                  )}
                  {plan.allergies && (
                    <p className="text-xs text-gray-600"><strong>Allergies:</strong> {plan.allergies}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
