import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { AuthContext } from "../App";
import { Leaf, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  if (user) { navigate("/", { replace: true }); return null; }

  async function handleEmailAuth(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      if (err.code === "auth/user-not-found" && !isRegister) { setIsRegister(true); setLoading(false); return; }
      setError(err.message.replace("Firebase: ", ""));
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setError("");
    try { await signInWithPopup(auth, googleProvider); navigate("/"); }
    catch (err) { setError(err.message.replace("Firebase: ", "")); }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-950 via-gray-900 to-gold-950 p-12 flex-col justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gold-500 rounded-full blur-[128px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold-600 rounded-full blur-[128px]" />
        </div>
        <div className="relative max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-lg shadow-gold-500/30">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-extrabold">NutriVision</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Assistant nutrition
            <br />
            <span className="bg-gradient-to-r from-gold-400 to-gold-300 bg-clip-text text-transparent">propulsé par l'IA</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Analysez vos repas, créez des plans nutritionnels personnalisés et recevez des recommandations intelligentes.
          </p>
          <div className="space-y-4">
            {[
              { icon: "📷", text: "Reconnaissance alimentaire instantanée" },
              { icon: "🤖", text: "Chatbot NutriBot IA (Gemma)" },
              { icon: "📋", text: "Plans de repas personnalisés" },
              { icon: "👨‍⚕️", text: "Pour coachs, nutritionnistes et patients" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{f.icon}</span>
                <span className="text-gray-300 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold">NutriVision</span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Bienvenue</h2>
          <p className="text-gray-500 text-sm mb-8">{isRegister ? "Créez votre compte" : "Connectez-vous à votre compte"}</p>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="input-field pl-10" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field pl-10" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{isRegister ? "Créer un compte" : "Se connecter"}<ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">ou continuer avec</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button onClick={handleGoogle} className="btn-secondary w-full">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>

          {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

          <p className="mt-6 text-center text-sm text-gray-500">
            {isRegister ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
            <button onClick={() => { setIsRegister(!isRegister); setError(""); }} className="text-gold-600 font-semibold hover:underline">
              {isRegister ? "Se connecter" : "S'inscrire"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
