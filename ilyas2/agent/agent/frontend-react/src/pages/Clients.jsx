import { useState } from "react";
import {
  Users, Plus, Trash2, Edit3, Save, X, Phone, Mail, Target,
  AlertTriangle, Activity, Calendar, Eye, Dumbbell, Apple,
} from "lucide-react";

const ACTIVITY_LEVELS = ["Sédentaire", "Légèrement actif", "Actif", "Très actif"];
const SEX_OPTIONS = ["Homme", "Femme"];

const EMPTY_CLIENT = {
  name: "", email: "", phone: "", age: "", sex: "Homme",
  weight: "", height: "", activityLevel: "Actif",
  goal: "", pathologie: "", restrictions: "", allergies: "",
  notes: "", startDate: new Date().toISOString().split("T")[0],
};

export default function Clients() {
  const [clients, setClients] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nv_clients")) || []; } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_CLIENT);
  const [planClient, setPlanClient] = useState(null);
  const [planText, setPlanText] = useState("");
  const [planLoading, setPlanLoading] = useState(false);

  function save() {
    let updated;
    if (editingId) {
      updated = clients.map((c) => c.id === editingId ? { ...form, id: editingId } : c);
    } else {
      updated = [...clients, { ...form, id: Date.now(), createdAt: new Date().toISOString() }];
    }
    setClients(updated);
    localStorage.setItem("nv_clients", JSON.stringify(updated));
    setForm(EMPTY_CLIENT);
    setEditingId(null);
    setShowForm(false);
  }

  function editClient(c) {
    setForm(c);
    setEditingId(c.id);
    setShowForm(true);
  }

  function deleteClient(id) {
    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    localStorage.setItem("nv_clients", JSON.stringify(updated));
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function generatePlan(client) {
    setPlanClient(client);
    setPlanText("");
    setPlanLoading(true);

    try {
      const res = await fetch("/api/clients/plan/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client }),
      });

      if (!res.ok) {
        setPlanText("Erreur lors de la génération du plan.");
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
              setPlanLoading(false);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              setPlanText((prev) => prev + parsed.token);
            } catch {}
          }
        }
      }
    } catch (err) {
      setPlanText(`Erreur: ${err.message}`);
    } finally {
      setPlanLoading(false);
    }
  }

  const bmi = (w, h) => w && h ? (w / ((h / 100) ** 2)).toFixed(1) : null;

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
              <Users className="w-5 h-5 text-gold-400" />
              <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Gestion Clients</span>
            </div>
            <h2 className="text-2xl font-extrabold">Vos Clients</h2>
            <p className="text-gray-400 text-sm mt-1">Gérez les profils, objectifs et restrictions de vos clients</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(EMPTY_CLIENT); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Nouveau client
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border-gold-200">
          <div className="px-6 py-4 border-b border-gold-100 bg-gold-50/50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{editingId ? "Modifier le client" : "Nouveau client"}</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Nom complet</label>
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ahmed Benali" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="client@email.com" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Téléphone</label>
                <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+212..." className="input-field" />
              </div>
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Âge</label>
                <input type="number" value={form.age} onChange={(e) => update("age", e.target.value)} placeholder="30" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Sexe</label>
                <select value={form.sex} onChange={(e) => update("sex", e.target.value)} className="input-field">
                  {SEX_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Poids (kg)</label>
                <input type="number" value={form.weight} onChange={(e) => update("weight", e.target.value)} placeholder="70" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Taille (cm)</label>
                <input type="number" value={form.height} onChange={(e) => update("height", e.target.value)} placeholder="175" className="input-field" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Niveau d'activité</label>
                <select value={form.activityLevel} onChange={(e) => update("activityLevel", e.target.value)} className="input-field">
                  {ACTIVITY_LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Objectif</label>
                <input type="text" value={form.goal} onChange={(e) => update("goal", e.target.value)} placeholder="Perte de poids, Prise de masse..." className="input-field" />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Pathologies</label>
                <input type="text" value={form.pathologie} onChange={(e) => update("pathologie", e.target.value)} placeholder="Diabète, Hypertension..." className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Restrictions</label>
                <input type="text" value={form.restrictions} onChange={(e) => update("restrictions", e.target.value)} placeholder="Sans gluten, low-carb..." className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Allergies</label>
                <input type="text" value={form.allergies} onChange={(e) => update("allergies", e.target.value)} placeholder="Noix, lactose..." className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Notes supplémentaires..." className="input-field h-16 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={save} className="btn-primary"><Save className="w-4 h-4" /> {editingId ? "Modifier" : "Enregistrer"}</button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Client Cards */}
      {clients.length === 0 && !showForm ? (
        <div className="card p-12 text-center text-gray-400">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="font-medium text-lg">Aucun client</p>
          <p className="text-sm mt-1">Ajoutez votre premier client pour commencer</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => {
            const b = bmi(Number(c.weight), Number(c.height));
            return (
              <div key={c.id} className="card hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-gold-500/20">
                        {c.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{c.name || "Sans nom"}</h4>
                        <p className="text-xs text-gray-500">{c.age}ans • {c.sex}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => editClient(c)} className="p-1.5 text-gray-400 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteClient(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {c.goal && <span className="px-2 py-0.5 bg-gold-50 text-gold-700 rounded-full text-[10px] font-semibold border border-gold-200">{c.goal}</span>}
                    {c.pathologie && <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-[10px] font-semibold border border-red-200">{c.pathologie}</span>}
                    {c.restrictions && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-semibold border border-amber-200">{c.restrictions}</span>}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-gray-50 rounded-lg"><p className="font-bold">{c.weight || "—"}</p><p className="text-gray-500">kg</p></div>
                    <div className="p-2 bg-gray-50 rounded-lg"><p className="font-bold">{c.height || "—"}</p><p className="text-gray-500">cm</p></div>
                    <div className="p-2 bg-gray-50 rounded-lg"><p className="font-bold">{b || "—"}</p><p className="text-gray-500">BMI</p></div>
                  </div>

                  {c.email && (
                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</p>
                  )}

                  <button
                    onClick={() => generatePlan(c)}
                    className="mt-3 w-full btn-primary text-xs !py-2"
                  >
                    <Dumbbell className="w-3.5 h-3.5" /> Plan Santé
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan Modal */}
      {planClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setPlanClient(null); setPlanText(""); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col m-4" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-gold-500/20">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Plan Santé — {planClient.name}</h3>
                  <p className="text-xs text-gray-500">
                    {planClient.age}ans • {planClient.sex} • {planClient.weight}kg • {planClient.height}cm
                    {planClient.pathologie && ` • ${planClient.pathologie}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setPlanClient(null); setPlanText(""); }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!planText && planLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2.5 h-2.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2.5 h-2.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              {planText && (
                <div className="prose prose-sm max-w-none">
                  {planText.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold text-gray-900 mt-4 mb-2">{line.slice(3)}</h2>;
                    if (line.startsWith("### ")) return <h3 key={i} className="text-md font-bold text-gold-700 mt-3 mb-1">{line.slice(4)}</h3>;
                    if (line.startsWith("**") && line.endsWith("**")) return <h4 key={i} className="font-bold text-gray-800 mt-2 mb-1">{line.slice(2, -2)}</h4>;
                    if (line.trim().startsWith("- ")) return <li key={i} className="text-gray-700 ml-4 list-disc">{line.trim().slice(2)}</li>;
                    if (line.trim().startsWith("* ")) return <li key={i} className="text-gray-700 ml-4 list-disc">{line.trim().slice(2)}</li>;
                    if (line.trim() === "") return <div key={i} className="h-2" />;
                    return <p key={i} className="text-gray-700">{line}</p>;
                  })}
                </div>
              )}
              {planLoading && (
                <div className="flex items-center gap-2 text-sm text-gold-600 mt-4">
                  <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
                  Génération en cours...
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
              <p className="text-[10px] text-gray-400">⚠️ Plan généré par IA — à adapter par un professionnel de santé</p>
              <button
                onClick={() => { setPlanClient(null); setPlanText(""); }}
                className="btn-secondary text-xs !py-1.5"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
