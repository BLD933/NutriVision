import { useState, useContext } from "react";
import { AuthContext } from "../App";
import { User, Save, Heart, Ruler, Weight, CalendarDays } from "lucide-react";

const DEFAULT_PROFILE = { nom: "", age: "", sex: "homme", height: "", weight: "", pathologie: "", calories_limit: 2000, sodium_limit_mg: 2000, sugar_limit_g: 90 };

export default function Profil() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nv_profile")) || DEFAULT_PROFILE; } catch { return DEFAULT_PROFILE; }
  });
  const [saved, setSaved] = useState(false);

  function update(field, value) { setProfile((p) => ({ ...p, [field]: value })); setSaved(false); }
  function save() { localStorage.setItem("nv_profile", JSON.stringify(profile)); setSaved(true); setTimeout(() => setSaved(false), 3000); }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-4">
          {user?.photoURL ? <img src={user.photoURL} alt="" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gold-500/30" /> : (
            <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-gold-500/20">
              {(user?.displayName || user?.email || "U")[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">{user?.displayName || "Utilisateur"}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2"><User className="w-5 h-5 text-gold-600" /> Informations personnelles</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Nom</label><input type="text" value={profile.nom} onChange={(e) => update("nom", e.target.value)} placeholder="Votre nom" className="input-field" /></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1 ml-1"><CalendarDays className="inline w-3 h-3 mr-1" />Âge</label><input type="number" value={profile.age} onChange={(e) => update("age", e.target.value)} placeholder="30" className="input-field" /></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Sexe</label><select value={profile.sex} onChange={(e) => update("sex", e.target.value)} className="input-field"><option value="homme">Homme</option><option value="femme">Femme</option></select></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1 ml-1"><Ruler className="inline w-3 h-3 mr-1" />Taille (cm)</label><input type="number" value={profile.height} onChange={(e) => update("height", e.target.value)} placeholder="170" className="input-field" /></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1 ml-1"><Weight className="inline w-3 h-3 mr-1" />Poids (kg)</label><input type="number" value={profile.weight} onChange={(e) => update("weight", e.target.value)} placeholder="70" className="input-field" /></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1 ml-1"><Heart className="inline w-3 h-3 mr-1" />Pathologie</label><input type="text" value={profile.pathologie} onChange={(e) => update("pathologie", e.target.value)} placeholder="Diabète, Hypertension..." className="input-field" /></div>
        </div>
      </div>
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900">Limites quotidiennes</h3></div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Calories (kcal)</label><input type="number" value={profile.calories_limit} onChange={(e) => update("calories_limit", Number(e.target.value))} className="input-field" /></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Sodium (mg)</label><input type="number" value={profile.sodium_limit_mg} onChange={(e) => update("sodium_limit_mg", Number(e.target.value))} className="input-field" /></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Sucres (g)</label><input type="number" value={profile.sugar_limit_g} onChange={(e) => update("sugar_limit_g", Number(e.target.value))} className="input-field" /></div>
        </div>
      </div>
      <button onClick={save} className="btn-primary"><Save className="w-4 h-4" />{saved ? "Enregistré !" : "Enregistrer le profil"}</button>
    </div>
  );
}
